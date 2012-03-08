#--------
# mosaic
#--------

(($) ->
  class Mosaic
    constructor: (el, options) ->
      _.extend @, options
      @padding ?= 5
      @el = el
      @num = 0
      @pos = {x: 0, y: 0}
      @processed = []
      @width = @el.width()
      @images = @images.slice(0,5)
      @count = @images.length
      @initImages()

    load: (imgpath) ->
      that = @
      img = new Image()
      img.name = imgpath
      img.src = imgpath
      img.onload = ->
        that.num += 1
        data =
          src: @src
          width: @width
          height: @height
          ratio: @width / @height
        that.img.push data
        if that.num is that.count then that.process(data)
        return true
      img

    initImages: ->
      @img = []
      for i in @images
        @load($(i).attr('src'))

    render: ->
      @el.html(@html())
      @cb()

    html: ->
      _.map(@processed, (i) ->
        "<img src='#{i.src}' class='mosaic' style='position: absolute; width: #{i.width}px; height: #{i.height}px; top: #{i.pos.y}px; left: #{i.pos.x}px;' />"
      ).join()

    available: (padding = 0)->
      @width - @pos.x - (@padding * padding)

    position: (img, pos, mult) ->
      img.width = img.ratio * mult
      img.height = (1/img.ratio)*img.width
      img.pos = {}
      img.pos.x = if pos.x > 0 then pos.x + (@padding * 2) else 0
      img.pos.y = pos.y
      @processed.push img
      if @processed.length is @count then @render()
      img

    horz: (imgs, pad) ->
      img = imgs.splice(0,1)[0]
      mult = @available(pad)/img.ratio
      img = @position(img, @pos, mult)
      @pos.y += img.height + (@padding * 2)

    vert: (imgs, mult, pad) ->
      img = imgs.splice(0,1)[0]
      if imgs.length
        mult ?= (@available())  / (img.ratio + @ratioVert(imgs))
        #mult ?= @available(1) / (img.ratio + @ratioVert(imgs))
      else
        mult ?= @available(1) / img.ratio
      img = @position(img, @pos, mult)
      @pos.x += img.width

    process: ->
      imgs = @img.slice(0)
      if imgs.length is 5 or (imgs[0].ratio > 1 and (imgs.length > 2 or imgs[0].ratio < imgs[1].ratio))
        @horz(imgs, 0)
      if imgs.length is 4
        #horiz layout
        if @ratioHorz(imgs.slice(1)) > 3
          #????
          mult = @available(.2) / (imgs[0].ratio + @ratioVert(imgs.slice(1)))
          @vert(imgs, mult)
          #split twice horz
          for i in imgs
            @horz(imgs, 2)
        else
          #take two lowest (tallest) and group them
          first = imgs.splice(0,1)
          sorted = _.sortBy(imgs, (i) -> i.ratio)
          second = sorted.splice(-1)
          ratio = 1 / (1/@ratioHorz(sorted)) + (1/second.ratio)
          mult = @available() / first.ratio + ratio
          @vert([first], mult)
          @horz([second])
          @vert(sorted)

      else if imgs.length is 3 and @ratioHorz(imgs) < 1.5
        #split twice v
        mult = @available(4) / @ratioHorz(imgs.slice(1))
        for i in imgs
          @vert(imgs, mult)
      else if (imgs.length is 3 and @ratioHorz(imgs) >= 1.5) or imgs.length is 2
        #horz layout
        if imgs.length is 2
          mult = @available(2) / (imgs[0].ratio + @ratioVert(imgs.slice(1)))
        else if imgs.length is 3
          mult = @available(1) / (imgs[0].ratio + @ratioVert(imgs.slice(1)))
        @vert(imgs, mult)
      if imgs.length is 2
        @horz(imgs, 2)
        @horz(imgs, 2)
      else if imgs.length is 1
        @horz(imgs, 2)

    ratioVert: (imgs) ->
      sum = 0
      for i in imgs
        sum += (1/i.ratio)
      ratio = (1/sum)

    ratioHorz: (indexes) ->
      sum = 0
      for i in indexes
        sum += i.ratio
      sum

    cb: ->
      if @callback then @callback()

  $.fn.mosaic = (options = {}) ->
    @each ->
      el = $(this)
      options = {}
      data = el.data('mosaic')
      unless data
        if options is 'auto'
          options = type: 'auto'
        options.width ?= el.width()
        options.images ?= el.children('img')
        el.data 'mosaic', data = new Mosaic(el, options)
      data

) window.Zepto || window.jQuery
