import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import cv2
import numpy as np

# --- Load TrOCR model (base version for CPU) ---
# 'microsoft/trocr-base-handwritten' is designed for handwritten text
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')

# Make sure to run on CPU
device = torch.device('cpu')
model.to(device)
def preprocess_image(image_path, target_height=128):
    """
    Load an image, convert to grayscale, denoise, resize for TrOCR.
    Returns a PIL RGB image.
    """
    # Load image with OpenCV
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not load image from {image_path}")
        return None

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Denoise using median blur
    gray = cv2.medianBlur(gray, 3)

    # Invert if necessary (white text on dark background)
    if np.mean(gray) < 127:
        gray = cv2.bitwise_not(gray)

    # Resize to target height while keeping aspect ratio
    h, w = gray.shape
    scale = target_height / h
    new_w = int(w * scale)
    resized = cv2.resize(gray, (new_w, target_height))

    # Convert to PIL RGB image for TrOCR
    pil_image = Image.fromarray(resized).convert("RGB")
    return pil_image


def ocr_image(image_path):
    """
    Preprocess image and extract handwritten text using TrOCR.
    """
    pil_image = preprocess_image(image_path)
    if pil_image is None:
        return None

    # Encode image and generate text
    pixel_values = processor(images=pil_image, return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    with torch.no_grad():
        generated_ids = model.generate(pixel_values)
    
    # Decode the text
    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text

if __name__ == '__main__':
    image_file = 'IMG_5105.jpg'  # Replace with your image path
    print(f"Processing image: {image_file}")

    extracted_text = ocr_image(image_file)

    if extracted_text:
        print("\n--- Extracted Handwritten Text ---")
        print(extracted_text)
    else:
        print("Text extraction failed.")