from PIL import Image, ImageDraw

img = Image.new('RGBA', (1536, 1024), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Fill with burgundy
draw.rectangle([(0, 0), (1536, 1024)], fill=(128, 0, 32, 255))

# Make the hole transparent
x1, y1 = 81, 281
x2, y2 = 1185, 642
draw.rectangle([(x1, y1), (x2, y2)], fill=(0, 0, 0, 0))

img.save("/Users/dhruvtomar/Desktop/syora/src/assets/truck_frame.png")
