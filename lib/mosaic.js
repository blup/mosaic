(function() {

  (function($) {
    var Mosaic;
    Mosaic = (function() {

      function Mosaic(el, options) {
        _.extend(this, options);
        if (this.padding == null) this.padding = 5;
        this.el = el;
        this.num = 0;
        this.pos = {
          x: 0,
          y: 0
        };
        this.processed = [];
        this.width = this.el.width();
        this.images = this.images.slice(0, 5);
        this.count = this.images.length;
        this.initImages();
      }

      Mosaic.prototype.load = function(imgpath) {
        var img, that;
        that = this;
        img = new Image();
        img.name = imgpath;
        img.src = imgpath;
        img.onload = function() {
          var data;
          that.num += 1;
          data = {
            src: this.src,
            width: this.width,
            height: this.height,
            ratio: this.width / this.height
          };
          that.img.push(data);
          if (that.num === that.count) that.process(data);
          return true;
        };
        return img;
      };

      Mosaic.prototype.initImages = function() {
        var i, _i, _len, _ref, _results;
        this.img = [];
        _ref = this.images;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(this.load($(i).attr('src')));
        }
        return _results;
      };

      Mosaic.prototype.render = function() {
        this.el.html(this.html());
        return this.cb();
      };

      Mosaic.prototype.html = function() {
        return _.map(this.processed, function(i) {
          return "<img src='" + i.src + "' class='mosaic' style='position: absolute; width: " + i.width + "px; height: " + i.height + "px; top: " + i.pos.y + "px; left: " + i.pos.x + "px;' />";
        }).join();
      };

      Mosaic.prototype.available = function(padding) {
        if (padding == null) padding = 0;
        return this.width - this.pos.x - (this.padding * padding);
      };

      Mosaic.prototype.position = function(img, pos, mult) {
        img.width = img.ratio * mult;
        img.height = (1 / img.ratio) * img.width;
        img.pos = {};
        img.pos.x = pos.x > 0 ? pos.x + (this.padding * 2) : 0;
        img.pos.y = pos.y;
        this.processed.push(img);
        if (this.processed.length === this.count) this.render();
        return img;
      };

      Mosaic.prototype.horz = function(imgs, pad) {
        var img, mult;
        img = imgs.splice(0, 1)[0];
        mult = this.available(pad) / img.ratio;
        img = this.position(img, this.pos, mult);
        return this.pos.y += img.height + (this.padding * 2);
      };

      Mosaic.prototype.vert = function(imgs, mult, pad) {
        var img;
        img = imgs.splice(0, 1)[0];
        if (imgs.length) {
          if (mult == null) {
            mult = (this.available()) / (img.ratio + this.ratioVert(imgs));
          }
        } else {
          if (mult == null) mult = this.available(1) / img.ratio;
        }
        img = this.position(img, this.pos, mult);
        return this.pos.x += img.width;
      };

      Mosaic.prototype.process = function() {
        var first, i, imgs, mult, ratio, second, sorted, _i, _j, _len, _len2;
        imgs = this.img.slice(0);
        if (imgs.length === 5 || (imgs[0].ratio > 1 && (imgs.length > 2 || imgs[0].ratio < imgs[1].ratio))) {
          this.horz(imgs, 0);
        }
        if (imgs.length === 4) {
          if (this.ratioHorz(imgs.slice(1)) > 3) {
            mult = this.available(.2) / (imgs[0].ratio + this.ratioVert(imgs.slice(1)));
            this.vert(imgs, mult);
            for (_i = 0, _len = imgs.length; _i < _len; _i++) {
              i = imgs[_i];
              this.horz(imgs, 2);
            }
          } else {
            first = imgs.splice(0, 1);
            sorted = _.sortBy(imgs, function(i) {
              return i.ratio;
            });
            second = sorted.splice(-1);
            ratio = 1 / (1 / this.ratioHorz(sorted)) + (1 / second.ratio);
            mult = this.available() / first.ratio + ratio;
            this.vert([first], mult);
            this.horz([second]);
            this.vert(sorted);
          }
        } else if (imgs.length === 3 && this.ratioHorz(imgs) < 1.5) {
          mult = this.available(4) / this.ratioHorz(imgs.slice(1));
          for (_j = 0, _len2 = imgs.length; _j < _len2; _j++) {
            i = imgs[_j];
            this.vert(imgs, mult);
          }
        } else if ((imgs.length === 3 && this.ratioHorz(imgs) >= 1.5) || imgs.length === 2) {
          if (imgs.length === 2) {
            mult = this.available(2) / (imgs[0].ratio + this.ratioVert(imgs.slice(1)));
          } else if (imgs.length === 3) {
            mult = this.available(1) / (imgs[0].ratio + this.ratioVert(imgs.slice(1)));
          }
          this.vert(imgs, mult);
        }
        if (imgs.length === 2) {
          this.horz(imgs, 2);
          return this.horz(imgs, 2);
        } else if (imgs.length === 1) {
          return this.horz(imgs, 2);
        }
      };

      Mosaic.prototype.ratioVert = function(imgs) {
        var i, ratio, sum, _i, _len;
        sum = 0;
        for (_i = 0, _len = imgs.length; _i < _len; _i++) {
          i = imgs[_i];
          sum += 1 / i.ratio;
        }
        return ratio = 1 / sum;
      };

      Mosaic.prototype.ratioHorz = function(indexes) {
        var i, sum, _i, _len;
        sum = 0;
        for (_i = 0, _len = indexes.length; _i < _len; _i++) {
          i = indexes[_i];
          sum += i.ratio;
        }
        return sum;
      };

      Mosaic.prototype.cb = function() {
        if (this.callback) return this.callback();
      };

      return Mosaic;

    })();
    return $.fn.mosaic = function(options) {
      if (options == null) options = {};
      return this.each(function() {
        var data, el;
        el = $(this);
        options = {};
        data = el.data('mosaic');
        if (!data) {
          if (options === 'auto') {
            options = {
              type: 'auto'
            };
          }
          if (options.width == null) options.width = el.width();
          if (options.images == null) options.images = el.children('img');
          el.data('mosaic', data = new Mosaic(el, options));
        }
        return data;
      });
    };
  })(window.Zepto || window.jQuery);

}).call(this);
