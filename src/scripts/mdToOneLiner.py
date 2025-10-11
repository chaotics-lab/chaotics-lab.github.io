import sys
import os

def md_to_oneliner(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Replace actual newlines with literal "\n"
        one_liner = content.replace('\n', '\\n')

        # Create output filename
        base_name = os.path.splitext(file_path)[0]
        output_file = f"{base_name}.txt"

        # Write to output file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(one_liner)

        print(f"One-liner written to '{output_file}'")
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python md_to_oneliner.py <file.md>")
    else:
        md_to_oneliner(sys.argv[1])
