from PIL import Image, ImageDraw, ImageFont

WIDTH = 2500
HEIGHT = 1686
ROWS = 2
COLS = 4

btn_width = WIDTH // COLS
btn_height = HEIGHT // ROWS

labels = [
    "Clear Settings", 
    "Low Quality Video", 
    "Standard Quality Video", 
    "High Quality Video", 
    "Show Set Values", 
    "Low Quality Audio", 
    "Standard Quaility Audio", 
    "High Quality Audio"
]

def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), color="white")
    draw = ImageDraw.Draw(img)

    try:
        # If using DejaVu on Ubuntu:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except:
        font = None

    for i, label in enumerate(labels):
        row = i // COLS
        col = i % COLS

        x0 = col * btn_width
        y0 = row * btn_height
        x1 = x0 + btn_width
        y1 = y0 + btn_height

        draw.rectangle([x0, y0, x1, y1], outline="black", width=5)

        # If 'font' is None, it means loading the specified TTF didn't work
        bbox = draw.textbbox((0, 0), label, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        text_x = x0 + (btn_width - text_w) / 2
        text_y = y0 + (btn_height - text_h) / 2
        draw.text((text_x, text_y), label, fill="black", font=font)

    img.save("richmenu_placeholder_customlabels.jpg", "JPEG")
    print("Saved richmenu_placeholder_customlabels.jpg")

if __name__ == "__main__":
    main()
