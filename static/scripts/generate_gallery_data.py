import os
import json
from pathlib import Path

def format_title(filename):
    """Convert filename to a readable title."""
    # Remove the .mp4 extension and replace underscores with spaces
    name = filename.replace('.mp4', '').replace('_', ' ')
    return name

def scan_directory(base_path):
    """Scan directories and create gallery data structure."""
    gallery_data = {
        "GPTEval3D": {
            "title": "GPT Evaluation Results",
            "videos": []
        },
        "T3Bench": {
            "title": "T3Bench Results",
            "videos": []
        },
        "Other": {
            "title": "Other Results",
            "videos": []
        }
    }

    # Process each section
    for section in gallery_data.keys():
        section_path = os.path.join(base_path, section)
        if os.path.exists(section_path):
            for filename in os.listdir(section_path):
                if filename.endswith('.mp4'):
                    video_entry = {
                        "title": format_title(filename),
                        "path": f"outputs_isd_new/{section}/{filename}"
                    }
                    gallery_data[section]["videos"].append(video_entry)
            
            # Sort videos by title
            gallery_data[section]["videos"].sort(key=lambda x: x["title"])

    return gallery_data

def main():
    # Set paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))  # Go up to root directory
    input_path = os.path.join(base_dir, 'static', 'outputs_isd_new')
    output_path = os.path.join(base_dir, 'static', 'data', 'gallery_data.json')

    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Generate gallery data
    gallery_data = scan_directory(input_path)

    # Write to JSON file with proper formatting
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, indent=2, ensure_ascii=False)

    print(f"Gallery data has been generated and saved to: {output_path}")
    
    # Print some statistics
    for section, data in gallery_data.items():
        print(f"\n{section}:")
        print(f"- Number of videos: {len(data['videos'])}")
        print("- Sample titles:")
        for video in data['videos'][:3]:  # Show first 3 titles as examples
            print(f"  * {video['title']}")

if __name__ == "__main__":
    main() 