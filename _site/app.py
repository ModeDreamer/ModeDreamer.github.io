from flask import Flask, jsonify
import os

# Initialize Flask app if not already done
app = Flask(__name__)

@app.route('/get_videos/<folder>')
def get_videos(folder):
    # Ensure the folder path is secure
    base_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static', 'outputs_isd_new')
    video_dir = os.path.join(base_dir, folder)
    
    print(f"Checking directory: {video_dir}")  # Debug log
    
    if not os.path.exists(video_dir):
        print(f"Directory not found: {video_dir}")  # Debug log
        return jsonify([])
    
    videos = [f for f in os.listdir(video_dir) 
              if f.lower().endswith(('.mp4', '.webm', '.ogg'))]
    
    print(f"Found videos: {videos}")  # Debug log
    return jsonify(videos)

# Add this if you're running the file directly
if __name__ == '__main__':
    app.run(debug=True) 