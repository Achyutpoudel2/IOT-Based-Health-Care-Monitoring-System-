from flask import Flask, request, jsonify
from flask_socketio import SocketIO
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
latest_data = {}
@app.route('/data', methods=['POST'])
def receive_data():
    global latest_data
    latest_data = request.json
    print("Received:", latest_data)
    # Simple rule-based logic
    alert = "Normal"
    if latest_data.get("heart_rate", 0) > 100:
        alert = "High Heart Rate"

    latest_data["alert"] = alert
    socketio.emit("update", latest_data)
    return {"status": "ok"}
@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(latest_data)
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)