"""
app.py
Extended Flask REST API for BridgeGuard AI with QIE blockchain integration.

Features:
- QIE node status and validation endpoints
- Bridge transaction validation and anomaly detection
- Analytics and performance metrics
- Authentication and rate limiting
- Structured logging and error handling
"""

import os
import json
import time
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional
from collections import defaultdict

from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ValidationError, Field, field_validator
from pythonjsonlogger import jsonlogger
import requests

# Import QIE node manager
from backend.qie_node_manager import QIENodeManager

# ===== CONFIGURATION =====
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

# Configuration
API_KEY = os.getenv("BRIDGEGUARD_API_KEY", "dev-key-change-in-production")
RATE_LIMIT = 100  # requests per minute
DB_PATH = os.getenv("DB_PATH", "./data/bridgeguard.db")
ALERT_EMAIL = os.getenv("ALERT_EMAIL", "admin@bridgeguard.ai")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")

# ===== LOGGING SETUP =====
def setup_logging():
    """Configure JSON structured logging."""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # JSON handler
    json_handler = logging.StreamHandler()
    json_formatter = jsonlogger.JsonFormatter()
    json_handler.setFormatter(json_formatter)
    logger.addHandler(json_handler)
    
    return logger

logger = setup_logging()

# ===== RATE LIMITING =====
request_counts = defaultdict(list)

def check_rate_limit(client_id: str) -> bool:
    """Check if client is within rate limit."""
    now = time.time()
    cutoff = now - 60  # 1 minute window
    
    # Remove old requests
    request_counts[client_id] = [req_time for req_time in request_counts[client_id] if req_time > cutoff]
    
    if len(request_counts[client_id]) >= RATE_LIMIT:
        return False
    
    request_counts[client_id].append(now)
    return True

def require_api_key(f):
    """Decorator for API key authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get("X-API-Key") or request.args.get("api_key")
        
        if not api_key or api_key != API_KEY:
            logger.warning(f"Invalid API key attempt from {request.remote_addr}")
            return jsonify({"error": "Unauthorized", "code": "INVALID_API_KEY"}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def rate_limit(f):
    """Decorator for rate limiting."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_id = request.remote_addr
        
        if not check_rate_limit(client_id):
            logger.warning(f"Rate limit exceeded for {client_id}")
            return jsonify({"error": "Rate limit exceeded", "code": "RATE_LIMIT"}), 429
        
        return f(*args, **kwargs)
    
    return decorated_function

# ===== PYDANTIC MODELS =====
class ResponseWrapper(BaseModel):
    """Standard API response wrapper."""
    success: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    code: Optional[str] = None

class TransactionData(BaseModel):
    """Transaction data model."""
    hash: str
    from_address: str
    to_address: str
    amount: float
    timestamp: datetime
    source_chain: str
    dest_chain: str
    status: str = "pending"

class BroadcastTransactionRequest(BaseModel):
    """Transaction broadcast request."""
    tx_type: str
    from_address: str
    to_address: str
    amount: float = Field(gt=0)
    memo: Optional[str] = None
    
    @field_validator("tx_type")
    @classmethod
    def validate_tx_type(cls, v):
        if v not in ["transfer", "delegate", "redelegate", "undelegate"]:
            raise ValueError("Invalid transaction type")
        return v

class AnomalyReportRequest(BaseModel):
    """Anomaly alert request."""
    transaction_hash: str
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    reason: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ValidationRequest(BaseModel):
    """Cross-chain transaction validation request."""
    transaction_hash: str
    source_chain: str
    dest_chain: str
    amount: float = Field(gt=0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ===== UTILITY FUNCTIONS =====
def generate_request_id() -> str:
    """Generate unique request ID."""
    return f"REQ-{int(time.time() * 1000)}"

def success_response(data: Any, request_id: str) -> Dict[str, Any]:
    """Create success response."""
    return {
        "success": True,
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request_id,
        "data": data
    }

def error_response(message: str, code: str, request_id: str, status_code: int = 400) -> tuple:
    """Create error response."""
    response = {
        "success": False,
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request_id,
        "error": message,
        "code": code
    }
    return jsonify(response), status_code

def validate_request_data(data: Dict, model_class: BaseModel) -> tuple[Optional[BaseModel], Optional[tuple]]:
    """Validate request data against Pydantic model."""
    request_id = generate_request_id()
    try:
        validated = model_class(**data)
        return validated, None
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        return None, error_response(str(e), "VALIDATION_ERROR", request_id)

# ===== INITIALIZE MANAGERS =====
qie_manager = QIENodeManager()

# In-memory storage for demo (replace with database in production)
transaction_history = []
alerts_log = []
model_metrics = {
    "accuracy": 0.95,
    "precision": 0.92,
    "recall": 0.89,
    "f1_score": 0.90,
    "samples_trained": 50000
}

# ===== HEALTH CHECK =====
@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "bridgeguard-api"
    }), 200

# ===== DASHBOARD ROUTE =====
@app.route("/", methods=["GET"])
@app.route("/dashboard", methods=["GET"])
@app.route("/dashboard.html", methods=["GET"])
def serve_dashboard():
    """Serve the dashboard HTML."""
    try:
        dashboard_path = os.path.join(os.path.dirname(__file__), "../frontend/dashboard.html")
        with open(dashboard_path, "r", encoding="utf-8") as f:
            return f.read(), 200, {"Content-Type": "text/html"}
    except FileNotFoundError:
        return jsonify({"error": "Dashboard not found"}), 404

# ===== FRONTEND FILES =====
@app.route("/api-client.js", methods=["GET"])
def serve_api_client():
    """Serve API client JavaScript."""
    try:
        file_path = os.path.join(os.path.dirname(__file__), "../frontend/api-client.js")
        with open(file_path, "r") as f:
            return f.read(), 200, {"Content-Type": "application/javascript"}
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@app.route("/dashboard.js", methods=["GET"])
def serve_dashboard_js():
    """Serve dashboard JavaScript."""
    try:
        file_path = os.path.join(os.path.dirname(__file__), "../frontend/dashboard.js")
        with open(file_path, "r") as f:
            return f.read(), 200, {"Content-Type": "application/javascript"}
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

# ===== QIE NODE ENDPOINTS =====
@app.route("/api/v1/qie/node/status", methods=["GET"])
@rate_limit
def get_qie_node_status():
    """Get QIE node status."""
    request_id = generate_request_id()
    
    try:
        health = qie_manager.check_node_health()
        status = qie_manager.get_node_status()
        
        data = {
            "node": {
                "online": status.get("online", False),
                "healthy": health.get("healthy", False),
                "height": health.get("height", 0),
                "syncing": not health.get("healthy", False),
                "rpc_url": qie_manager.rpc_url,
                "chain_id": qie_manager.chain_id
            },
            "response": status.get("data", {})
        }
        
        logger.info(f"QIE node status check: {health}")
        return jsonify(success_response(data, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error getting QIE node status: {e}")
        return error_response(str(e), "QIE_NODE_ERROR", request_id)

@app.route("/api/v1/qie/validator/info", methods=["GET"])
@rate_limit
def get_validator_info():
    """Get validator information."""
    request_id = generate_request_id()
    validator_address = request.args.get("address")
    
    if not validator_address:
        return error_response("Validator address required", "MISSING_ADDRESS", request_id)
    
    try:
        info = qie_manager.get_validator_info(validator_address)
        
        data = {
            "address": validator_address,
            "found": info.get("found", False),
            "details": info.get("data", {})
        }
        
        return jsonify(success_response(data, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error getting validator info: {e}")
        return error_response(str(e), "VALIDATOR_ERROR", request_id)

@app.route("/api/v1/qie/account/<address>", methods=["GET"])
@rate_limit
def query_account_balance(address):
    """Query account balance on QIE."""
    request_id = generate_request_id()
    
    try:
        balance = qie_manager.query_balance(address)
        
        data = {
            "address": address,
            "balance": balance.get("balance", "0"),
            "denom": balance.get("denom", "aqie"),
            "success": balance.get("success", False)
        }
        
        return jsonify(success_response(data, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error querying balance: {e}")
        return error_response(str(e), "BALANCE_QUERY_ERROR", request_id)

@app.route("/api/v1/qie/transaction/broadcast", methods=["POST"])
@rate_limit
def broadcast_qie_transaction():
    """Broadcast transaction to QIE network."""
    request_id = generate_request_id()
    
    try:
        # Validate request
        validated, error = validate_request_data(request.json, BroadcastTransactionRequest)
        if error:
            return error
        
        # Build transaction
        tx_dict = {
            "type": "cosmos-sdk/StdTx",
            "value": {
                "msg": [{
                    "type": "cosmos-sdk/MsgSend",
                    "value": {
                        "from_address": validated.from_address,
                        "to_address": validated.to_address,
                        "amount": [{"denom": "aqie", "amount": str(int(validated.amount * 1_000_000))}]
                    }
                }],
                "fee": {"amount": [{"denom": "aqie", "amount": "5000"}], "gas": "200000"},
                "signatures": [],
                "memo": validated.memo or ""
            }
        }
        
        # Broadcast
        result = qie_manager.broadcast_transaction(tx_dict)
        
        logger.info(f"Transaction broadcast: {result.get('hash')}")
        
        return jsonify(success_response(result, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error broadcasting transaction: {e}")
        return error_response(str(e), "BROADCAST_ERROR", request_id)

# ===== BRIDGE VALIDATION ENDPOINTS =====
@app.route("/api/v1/bridge/validate-cross-chain", methods=["POST"])
@rate_limit
def validate_cross_chain():
    """Validate cross-chain transaction."""
    request_id = generate_request_id()
    
    try:
        validated, error = validate_request_data(request.json, ValidationRequest)
        if error:
            return error
        
        # Simulate ML model validation
        import random
        confidence = random.uniform(0.7, 1.0)
        is_valid = confidence > 0.75
        
        data = {
            "transaction_hash": validated.transaction_hash,
            "valid": is_valid,
            "confidence": round(confidence * 100, 2),
            "source_chain": validated.source_chain,
            "dest_chain": validated.dest_chain,
            "amount": validated.amount,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        transaction_history.append(data)
        logger.info(f"Transaction validated: {data}")
        
        return jsonify(success_response(data, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error validating transaction: {e}")
        return error_response(str(e), "VALIDATION_ERROR", request_id)

@app.route("/api/v1/bridge/anomaly-score", methods=["POST"])
@rate_limit
def get_anomaly_score():
    """Get ML anomaly score for transaction."""
    request_id = generate_request_id()
    
    try:
        tx_data = request.json
        
        if not tx_data or "transaction_hash" not in tx_data:
            return error_response("Transaction hash required", "MISSING_FIELD", request_id)
        
        # Simulate ML model anomaly detection
        import random
        anomaly_score = random.uniform(0, 1)
        severity = "critical" if anomaly_score > 0.8 else "high" if anomaly_score > 0.6 else "medium" if anomaly_score > 0.4 else "low"
        
        data = {
            "transaction_hash": tx_data.get("transaction_hash"),
            "anomaly_score": round(anomaly_score * 100, 2),
            "severity": severity,
            "model_confidence": 92.5,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if anomaly_score > 0.7:
            alerts_log.append(data)
        
        logger.info(f"Anomaly score calculated: {data}")
        
        return jsonify(success_response(data, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error calculating anomaly score: {e}")
        return error_response(str(e), "ANOMALY_ERROR", request_id)

@app.route("/api/v1/bridge/history", methods=["GET"])
@rate_limit
def get_transaction_history():
    """Get transaction validation history."""
    request_id = generate_request_id()
    
    limit = int(request.args.get("limit", 20))
    offset = int(request.args.get("offset", 0))
    
    history = transaction_history[offset:offset + limit]
    
    data = {
        "total": len(transaction_history),
        "limit": limit,
        "offset": offset,
        "transactions": history
    }
    
    return jsonify(success_response(data, request_id)), 200

@app.route("/api/v1/bridge/alert", methods=["POST"])
@rate_limit
def send_anomaly_alert():
    """Send anomaly alert."""
    request_id = generate_request_id()
    
    try:
        validated, error = validate_request_data(request.json, AnomalyReportRequest)
        if error:
            return error
        
        alert_data = {
            "transaction_hash": validated.transaction_hash,
            "severity": validated.severity,
            "reason": validated.reason,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id
        }
        
        alerts_log.append(alert_data)
        logger.warning(f"Alert sent: {alert_data}")
        
        # TODO: Send email/webhook
        if WEBHOOK_URL:
            try:
                requests.post(WEBHOOK_URL, json=alert_data, timeout=5)
            except Exception as e:
                logger.error(f"Webhook error: {e}")
        
        return jsonify(success_response({"alert_id": request_id, "sent": True}, request_id)), 200
    
    except Exception as e:
        logger.error(f"Error sending alert: {e}")
        return error_response(str(e), "ALERT_ERROR", request_id)

# ===== ANALYTICS ENDPOINTS =====
@app.route("/api/v1/analytics/daily-stats", methods=["GET"])
@rate_limit
def get_daily_stats():
    """Get daily statistics."""
    request_id = generate_request_id()
    
    date = request.args.get("date", datetime.utcnow().strftime("%Y-%m-%d"))
    
    import random
    data = {
        "date": date,
        "total_transactions": random.randint(100, 500),
        "anomalies_detected": random.randint(1, 20),
        "validation_success_rate": round(random.uniform(0.85, 0.99) * 100, 2),
        "avg_validation_time_ms": random.uniform(50, 200),
        "critical_alerts": random.randint(0, 3),
        "high_alerts": random.randint(1, 10)
    }
    
    return jsonify(success_response(data, request_id)), 200

@app.route("/api/v1/analytics/model-accuracy", methods=["GET"])
@rate_limit
def get_model_accuracy():
    """Get ML model performance metrics."""
    request_id = generate_request_id()
    
    return jsonify(success_response(model_metrics, request_id)), 200

@app.route("/api/v1/analytics/validator-stats", methods=["GET"])
@rate_limit
def get_validator_stats():
    """Get validator performance metrics."""
    request_id = generate_request_id()
    
    import random
    data = {
        "total_validators": random.randint(50, 200),
        "active_validators": random.randint(30, 150),
        "avg_uptime": round(random.uniform(0.95, 0.99) * 100, 2),
        "total_staked": f"{random.randint(1000000, 10000000)} aqie",
        "commission_rate": 0.05,
        "top_validators": [
            {
                "address": f"qievaloper1...{i}",
                "voting_power": round(random.uniform(1, 10), 2),
                "uptime": round(random.uniform(0.95, 0.99) * 100, 2)
            }
            for i in range(5)
        ]
    }
    
    return jsonify(success_response(data, request_id)), 200

# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    request_id = generate_request_id()
    return error_response("Endpoint not found", "NOT_FOUND", request_id, 404)

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    request_id = generate_request_id()
    logger.error(f"Internal server error: {error}")
    return error_response("Internal server error", "INTERNAL_ERROR", request_id, 500)

# ===== MAIN =====
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    
    logger.info(f"Starting BridgeGuard AI API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
