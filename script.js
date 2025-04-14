// Transpiled to ES5
function lerp(current, target) {
    var fraction = 0.1;
    var x = current.x + (target.x - current.x) * fraction;
    var y = current.y + (target.y - current.y) * fraction;
    return { x: x, y: y };
  }
  
  function Slider(el) {
    var self = this;
    this.IMG_CLASS = 'slider__images-item';
    this.TEXT_CLASS = 'slider__text-item';
    this.ACTIVE_IMG_CLASS = this.IMG_CLASS + '--active';
    this.ACTIVE_TEXT_CLASS = this.TEXT_CLASS + '--active';
  
    // Button configuration for each image
    // this.buttonConfig = {
    //   '1': { text: 'Explore Pushkar' },
    //   '2': { text: 'Explore Lake', url: '/lake' },
    //   '3': { text: 'Explore Cliffs', url: '/cliffs' },
    //   '4': { text: 'Explore Mountains', url: '/mountains' },
    //   '5': { text: 'Explore Peaks', url: '/peaks' }
    // };
  
    this.el = el;
    this.contentEl = document.getElementById('slider-content');
    this.buttons = el.getElementsByClassName('button');
    this.onMouseMove = this.onMouseMove.bind(this);
  
    this.activeImg = el.getElementsByClassName(this.ACTIVE_IMG_CLASS);
    this.activeText = el.getElementsByClassName(this.ACTIVE_TEXT_CLASS);
    this.images = el.getElementsByTagName('img');
  
    document.getElementById('slider-dots').addEventListener('click', this.onDotClick.bind(this));
    document.getElementById('left').addEventListener('click', this.prev.bind(this));
    document.getElementById('right').addEventListener('click', this.next.bind(this));
  
    // Add click handlers for all buttons
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        var url = self.buttonConfig[id].url;
        window.open(url, '_blank');
      });
    }
  
    window.addEventListener('resize', this.onResize.bind(this));
  
    this.onResize();
  
    this.length = this.images.length;
    this.lastX = this.lastY = this.targetX = this.targetY = 0;
  
    // Initialize button states
    this.updateButtons(1);
  }
  
  Slider.prototype.onResize = function () {
    var htmlStyles = getComputedStyle(document.documentElement);
    var mobileBreakpoint = htmlStyles.getPropertyValue('--mobile-bkp');
    var isMobile = this.isMobile = window.matchMedia('only screen and (max-width: ' + mobileBreakpoint + ')').matches;
  
    this.halfWidth = window.innerWidth / 2;
    this.halfHeight = window.innerHeight / 2;
    this.zDistance = htmlStyles.getPropertyValue('--z-distance');
  
    if (!isMobile && !this.mouseWatched) {
      this.mouseWatched = true;
      this.el.addEventListener('mousemove', this.onMouseMove);
      this.el.style.setProperty('--img-prev', 'url(' + this.images[+this.activeImg[0].dataset.id - 1].src + ')');
      this.contentEl.style.setProperty('transform', 'translateZ(' + this.zDistance + ')');
    } else if (isMobile && this.mouseWatched) {
      this.mouseWatched = false;
      this.el.removeEventListener('mousemove', this.onMouseMove);
      this.contentEl.style.setProperty('transform', 'none');
    }
  };
  
  Slider.prototype.getMouseCoefficients = function (event) {
    var pageX = event ? event.pageX : this.targetX;
    var pageY = event ? event.pageY : this.targetY;
    var xCoeff = (pageX - this.halfWidth) / this.halfWidth;
    var yCoeff = (this.halfHeight - pageY) / this.halfHeight;
    return { xCoeff: xCoeff, yCoeff: yCoeff };
  };
  
  Slider.prototype.onMouseMove = function (event) {
    this.targetX = event.pageX;
    this.targetY = event.pageY;
  
    if (!this.animationRunning) {
      this.animationRunning = true;
      this.runAnimation();
    }
  };
  
  Slider.prototype.runAnimation = function () {
    var self = this;
    if (this.animationStopped) {
      this.animationRunning = false;
      return;
    }
  
    var maxX = 10;
    var maxY = 10;
  
    var newPos = lerp(
      { x: this.lastX, y: this.lastY },
      { x: this.targetX, y: this.targetY }
    );
  
    var mouseCoeffs = this.getMouseCoefficients({ pageX: newPos.x, pageY: newPos.y });
    var xCoeff = mouseCoeffs.xCoeff;
    var yCoeff = mouseCoeffs.yCoeff;
  
    this.lastX = newPos.x;
    this.lastY = newPos.y;
  
    this.positionImage({ xCoeff: xCoeff, yCoeff: yCoeff });
  
    this.contentEl.style.setProperty('transform', 'translateZ(' + this.zDistance + ') rotateX(' + (maxY * yCoeff) + 'deg) rotateY(' + (maxX * xCoeff) + 'deg)');
  
    if (this.reachedFinalPoint()) {
      this.animationRunning = false;
    } else {
      requestAnimationFrame(function () { self.runAnimation(); });
    }
  };
  
  Slider.prototype.reachedFinalPoint = function () {
    var lastX = ~~this.lastX;
    var lastY = ~~this.lastY;
    var targetX = this.targetX;
    var targetY = this.targetY;
  
    return (lastX === targetX || lastX - 1 === targetX || lastX + 1 === targetX) &&
           (lastY === targetY || lastY - 1 === targetY || lastY + 1 === targetY);
  };
  
  Slider.prototype.positionImage = function (coeffs) {
    var xCoeff = coeffs.xCoeff;
    var yCoeff = coeffs.yCoeff;
    var maxImgOffset = 1;
    var currentImage = this.activeImg[0].children[0];
  
    currentImage.style.setProperty('transform', 'translateX(' + (maxImgOffset * -xCoeff) + 'em) translateY(' + (maxImgOffset * yCoeff) + 'em)');
  };
  
  Slider.prototype.onDotClick = function (event) {
    if (this.inTransit) return;
  
    var dot = event.target.closest('.slider__nav-dot');
    if (!dot) return;
  
    var nextId = dot.dataset.id;
    var currentId = this.activeImg[0].dataset.id;
  
    if (currentId === nextId) return;
  
    this.startTransition(nextId);
  };
  
  Slider.prototype.updateButtons = function (id) {
    for (var i = 0; i < this.buttons.length; i++) {
      var button = this.buttons[i];
      var buttonId = button.getAttribute('data-id');
      if (buttonId === id) {
        button.textContent = this.buttonConfig[id].text;
      }
    }
  };
  
  Slider.prototype.transitionItem = function (nextId) {
    var self = this;
    var el = this.el;
    var currentImg = this.activeImg[0];
    var currentId = currentImg.dataset.id;
    var imgClass = this.IMG_CLASS;
    var textClass = this.TEXT_CLASS;
    var activeImgClass = this.ACTIVE_IMG_CLASS;
    var activeTextClass = this.ACTIVE_TEXT_CLASS;
    var subActiveClass = imgClass + '--subactive';
    var transitClass = imgClass + '--transit';
    var nextImg = el.querySelector('.' + imgClass + '[data-id="' + nextId + '"]');
    var nextText = el.querySelector('.' + textClass + '[data-id="' + nextId + '"]');
  
    function onImageTransitionEnd(e) {
      e.stopPropagation();
      nextImg.classList.remove(transitClass);
      self.inTransit = false;
      this.className = imgClass;
      this.removeEventListener('transitionend', onImageTransitionEnd);
    }
  
    var outClass = '';
    var inClass = '';
  
    this.animationStopped = true;
  
    nextText.classList.add(activeTextClass);
  
    el.style.setProperty('--from-left', nextId);
  
    currentImg.classList.remove(activeImgClass);
    currentImg.classList.add(subActiveClass);
  
    if (currentId < nextId) {
      outClass = imgClass + '--next';
      inClass = imgClass + '--prev';
    } else {
      outClass = imgClass + '--prev';
      inClass = imgClass + '--next';
    }
  
    nextImg.classList.add(outClass);
  
    requestAnimationFrame(function () {
      nextImg.classList.add(transitClass, activeImgClass);
      nextImg.classList.remove(outClass);
  
      self.animationStopped = false;
      self.positionImage(self.getMouseCoefficients());
  
      currentImg.classList.add(transitClass, inClass);
      currentImg.addEventListener('transitionend', onImageTransitionEnd);
  
      // Update buttons for the new active image
      self.updateButtons(nextId);
    });
  
    if (!this.isMobile) {
      this.switchBackgroundImage(nextId);
    }
  };
  
  Slider.prototype.startTransition = function (nextId) {
    var self = this;
    if (this.inTransit) return;
  
    var activeText = this.activeText[0];
    var backwardsClass = this.TEXT_CLASS + '--backwards';
  
    function onTextTransitionEnd(e) {
      if (!e.pseudoElement) {
        e.stopPropagation();
        requestAnimationFrame(function () {
          self.transitionItem(nextId);
        });
        this.removeEventListener('transitionend', onTextTransitionEnd);
      }
    }
  
    this.inTransit = true;
  
    activeText.classList.add(backwardsClass);
    activeText.classList.remove(this.ACTIVE_TEXT_CLASS);
    activeText.addEventListener('transitionend', onTextTransitionEnd);
  
    requestAnimationFrame(function () {
      activeText.classList.remove(backwardsClass);
    });
  };
  
  Slider.prototype.next = function () {
    if (this.inTransit) return;
  
    var nextId = +this.activeImg[0].dataset.id + 1;
  
    if (nextId > this.length) {
      nextId = 1;
    }
  
    this.startTransition(nextId);
  };
  
  Slider.prototype.prev = function () {
    if (this.inTransit) return;
  
    var nextId = +this.activeImg[0].dataset.id - 1;
  
    if (nextId < 1) {
      nextId = this.length;
    }
  
    this.startTransition(nextId);
  };
  
  Slider.prototype.switchBackgroundImage = function (nextId) {
    var self = this;
    var bgClass = 'slider--bg-next';
    var el = this.el;
    var imageUrl = 'url(' + this.images[+nextId - 1].src + ')';
  
    function onBackgroundTransitionEnd(e) {
      if (e.target === this) {
        this.style.setProperty('--img-prev', imageUrl);
        this.classList.remove(bgClass);
        this.removeEventListener('transitionend', onBackgroundTransitionEnd);
      }
    }
  
    el.style.setProperty('--img-next', imageUrl);
    el.addEventListener('transitionend', onBackgroundTransitionEnd);
    el.classList.add(bgClass);
  };
  
  var sliderEl = document.getElementById('slider');
  var slider = new Slider(sliderEl);
  
  // Demo stuff
  var timer = 0;
  
  function autoSlide() {
    requestAnimationFrame(function () {
      slider.next();
    });
    timer = setTimeout(autoSlide, 5000);
  }
  
  function stopAutoSlide() {
    clearTimeout(timer);
    this.removeEventListener('touchstart', stopAutoSlide);
    this.removeEventListener('mousemove', stopAutoSlide);
  }
  
  sliderEl.addEventListener('mousemove', stopAutoSlide);
  sliderEl.addEventListener('touchstart', stopAutoSlide);
  
  timer = setTimeout(autoSlide, 5000);

  