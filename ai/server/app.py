from flask import Flask, jsonify, request, send_file, render_template
import os
import time
import sys
import pyttsx3
import tempfile
import psutil
from ai.agents.registry import AgentRegistry
from ai.agents.store.provider_store import ProviderStore

app = Flask(__name__, template_folder='../../templates')

# Dummy latency log and agent status for demo
latency_log = [
    {"timestamp": time.time(), "latency_ms": 120},
    {"timestamp": time.time(), "latency_ms": 150}
]
agents_status = {
    "instruct": "active",
    "blog_writer_bn": "idle"
}

@app.route("/status")
def status():
    # Fallback provider info (dummy)
    fallback_info = {
        "provider": "openai",
        "fallback": False,
        "last_error": None
    }
    # System resource usage
    ram = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=0.5)
    # Dynamic agent status
    agent_status = {}
    for agent_name in AgentRegistry._agents.keys():
        try:
            agent = AgentRegistry.get_agent(agent_name)
            agent_status[agent_name] = "active"
        except Exception as e:
            agent_status[agent_name] = f"disabled: {str(e)}"
    return jsonify({
        "dispatcher_active": True,
        "latency_log": latency_log,
        "agents_status": agent_status,
        "fallback_info": fallback_info,
        "system": {
            "ram_percent": ram.percent,
            "ram_total_gb": round(ram.total / (1024**3), 2),
            "ram_available_gb": round(ram.available / (1024**3), 2),
            "cpu_percent": cpu
        }
    })

@app.route("/dispatch")
def dispatch():
    agent = request.args.get("agent")
    text = request.args.get("text")
    if not agent or not text:
        return jsonify({"error": "Missing agent or text"}), 400

    # MCP Dispatcher কল করার জন্য
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/mcp')))
    try:
        from dispatcher import run_agent
        result = run_agent(agent, prompt=text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/voice_chat", methods=["POST"])
def voice_chat():
    data = request.get_json()
    text = data.get("text")
    agent = data.get("agent", "instruct")
    if not text:
        return jsonify({"error": "Missing text"}), 400
    # Agent response
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/mcp')))
    from dispatcher import run_agent
    result = run_agent(agent, prompt=text)
    # Text-to-speech
    engine = pyttsx3.init()
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tf:
        engine.save_to_file(result["result"], tf.name)
        engine.runAndWait()
        audio_path = tf.name
    return send_file(audio_path, mimetype="audio/mpeg", as_attachment=True, download_name="response.mp3")

@app.route("/admin")
def admin_panel():
    return render_template("admin_panel.html")

@app.route("/dashboard")
def dashboard():
    return render_template("admin/dashboard.html")

@app.route("/agents")
def agents():
    return render_template("admin/agents.html")

@app.route("/api/provider/<provider_id>/clear_memory", methods=["POST"])
def clear_provider_memory(provider_id):
    store = ProviderStore()
    store.clear_memory(provider_id)
    return jsonify({"status": "success", "message": f"Memory cleared for provider {provider_id}"})

@app.route("/api/provider/memory_status", methods=["GET"])
def provider_memory_status():
    store = ProviderStore()
    all_mem = store.get_all_providers()
    status = {pid: {"keys": list(mem.keys()), "size": len(str(mem))} for pid, mem in all_mem.items()}
    return jsonify(status)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000) 