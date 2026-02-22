from services.gemini_service import _generate_content_http

if __name__ == "__main__":
    prompt = "Return exactly 6 JSON objects with names"
    try:
        result = _generate_content_http(prompt, "gemini-2.0-flash")
        print(result)
    except Exception as e:
        with open("error_out.txt", "w") as f:
            f.write(str(e))
        print("Wrote error to error_out.txt")
