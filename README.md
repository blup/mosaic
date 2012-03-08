# Mosaic

Generate beautiful image mosaics with a couple of lines of code. The algorithm will favoritize the first image, making it full width if the image is wide, or full height otherwise. Subsequent images are then arranged to keep things squared. Note: the plugin accepts up to 5 images, in order to keep things quick - any extra images will be removed.

HTML:

```html
<div id="container">
    <img src="img-1.jpg" />
    <img src="img-2.jpg" />
    <img src="img-3.jpg" />
    <img src="img-4.jpg" />
    <img src="img-5.jpg" />
</div>
```

CSS:

```css
#container {
  width: 500px;
}
```

JS:

```js
$('#container').mosaic()
```
