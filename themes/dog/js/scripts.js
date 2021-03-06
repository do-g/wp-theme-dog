function dog__base_lib() {

	var self = this;

  /***** webfonts *****/

  this.font_loading = function (family, variation) {
    preloader.register(preloader_font_to_key(family, variation));
  }

  this.font_ready = function (family, variation) {
    preloader.done(preloader_font_to_key(family, variation));
  }

  this.fonts_ready = function () {
    preloader.done('fonts');
  }

  var webfont_config = {
    classes: false,
    fontloading: self.font_loading,
    fontactive: self.font_ready,
    fontinactive: self.font_ready,
    active: self.fonts_ready,
    inactive: self.fonts_ready
  };

  this.set_webfonts = function (custom_fonts) {
    jQuery.extend(webfont_config, custom_fonts);
  }

  function webfonts_registered() {
    return webfont_config && ((webfont_config.google && webfont_config.google.families.length) || (webfont_config.custom && webfont_config.custom.families.length));
  }

  /***** preloader *****/

  var preloader = {
  	timeout: null,
  	wait: 10000,
  	reset: function() {
      clearTimeout(this.timeout);
      this.$container = null;
      this.debug = false;
      this.queue = {};
      this.times = {};
      this.assets = ['sessions'];
      this.images_registered = false;
      this.count_images_loaded = 0;
  	},
  	register: function(key, asset_type) {
      if (!asset_type || this.watches(asset_type)) {
  		  this.queue[key] = false;
        if (this.debug) {
          var t = this.set_time_registered(key);
          console.log('registered key [' + key + '] of type [' + asset_type + '] at ' + t);
        }
        return true;
      }
      return false;
  	},
  	done: function(key) {
  	  if (this.queue.hasOwnProperty(key)) {
  			this.queue[key] = true;
        if (this.debug) {
          var t = this.get_time_elapsed(key);
          console.log('completed key [' + key + '] in [' + t[0] + '] seconds at ' + t[1]);
        }
  			this.check();
        return true;
  	  }
      return false;
  	},
  	check: function() {
  	  var total = done = 0;
  	  for (key in this.queue) {
  	    total++;
  	    if (this.queue[key]) {
  	      done++;
  	    }
  	  }
  	  var percent = done / total * 100;
  	  return this.update(percent);
  	},
  	update: function(percent) {
  	  percent = percent && percent > 1 ? percent : 1;
  	  jQuery('.preloader .bar').css('width', percent + '%');
  	  if (percent == 100) {
  	    this.trigger_complete();
  	  }
      return percent;
  	},
    listen: function() {
      jQuery(document).on('dog.preloader_complete', function() {
        preloader.complete();
      });
    },
    trigger_complete: function() {
      jQuery(document).trigger('dog.preloader_complete');
    },
    complete: function() {
      jQuery('body').removeClass('preloading').addClass('ready');
      if (this.debug) {
        var t = this.get_time_elapsed('preloader');
        console.log('completed key [preloader] in [' + t[0] + '] seconds at ' + t[1]);
      }
      this.reset();
    },
    force_complete: function() {
      for (key in this.queue) {
        if (!this.queue[key]) {
          console.log('failed to load key: ' + key);
        }
        this.queue[key] = true;
      }
      this.check();
    },
    watch: function (list) {
      jQuery.extend(this.assets, list);
    },
    watches: function (type) {
      return $s.in_array(type, this.assets);
    },
    set_time_registered: function (key) {
      var d = new Date();
      var t = d.getTime();
      this.times[key] = t;
      return t;
    },
    get_time_elapsed: function (key) {
      var d = new Date();
      var t = d.getTime();
      var secs = (t - this.times[key]) / 1000;
      return [secs.toPrecision(2), t];
    }
  };

  this.preload = function (asset_types, container_selector, debug) {
    preloader.reset();
    preloader.debug = debug;
    if (preloader.debug) {
      preloader.set_time_registered('preloader');
    }
    preloader.listen();
    container_selector = container_selector ? container_selector : 'body';
    preloader.$container = jQuery(container_selector);
    preloader.watch(asset_types);
    preloader.timeout = setTimeout(function(){
      preloader.force_complete();
    }, preloader.wait);
    this.preloader_register('session', 'sessions');
    if (webfonts_registered() && preloader.watches('fonts')) {
      preloader.register('fonts');
      WebFont.load(webfont_config);
    }
  }

  this.preload_images = function () {
    if (!preloader.watches('images')) {
      return false;
    }
    preloader.images_registered = false;
    preloader.count_images_loaded = 0;
    preloader.register('images');
    preloader.$container.imagesLoaded({ background: '.has-bg-img' }, function() {
      preloader.done('images');
    }).progress(function(instance, image) {
      if (!preloader.images_registered) {
        preloader_register_images(instance.images.length);
      }
      preloader.count_images_loaded++;
      preloader.done(preloader_image_to_key(preloader.count_images_loaded));
    });
    return true;
  }

  this.preloader_register = function(key, asset_type) {
    return preloader.register(key, asset_type);
  }

  this.preloader_done = function(key) {
    return preloader.done(key);
  }

  function preloader_image_to_key(number) {
    return $s.string_to_key(number, 'image');
  }

  function preloader_font_to_key(family, variation) {
    return $s.string_to_key(family + variation, 'font');
  }

  function preloader_register_images(count) {
    preloader.images_registered = true;
    for (n = 1; n <= count; n++) {
      preloader.register(preloader_image_to_key(n));
    }
  }

  /***** breadcrumbs *****/

  var breadcrumbs = {
    options: {
      container_selector: '.breadcrumbs',
      menu_selector: '.main-menu',
      menu_item_selector: '#menu-item-$id',
      active_trail_selectors: [
        'li.current-menu-ancestor > a',
        'li.current-menu-item > a',
        'li.current-post-ancestor > a'
      ],
      base_items: [
        {label: dog__sh && dog__sh.labels.home ? dog__sh.labels.home : 'Home', url: '/', options: {css_class: 'base'}}
      ],
      fix_menu_trail: false
    },
    debug: function (message) {
      if (this.options.debug) {
        console.log(message);
      }
    },
    add_menu_item: function (id, options) {
      var menu_item_selector = this.options.menu_item_selector.replace('$id', id);
      $menu_item = this.$menu.find(menu_item_selector);
      $a = $menu_item.children('a');
      this.add($a.text(), $a.attr('href'), options);
    },
    add: function (label, url, options) {
      var $a = jQuery('<a></a>');
      if (options && $s.defined_and_not_empty(options.position)) {
        var $sibling = this.$container.find('a').eq(options.position);
        if ($sibling.size()) {
          $sibling.before($a);
        } else {
          $a.appendTo(this.$container);
        }
      } else {
        $a.appendTo(this.$container);
      }
      $a.text(label);
      $a.attr('href', url);
      if (options && options.css_class) {
        $a.addClass(options.css_class);
      }
    },
    build: function () {
      var item;
      var bc = this.options.base_items;
      this.debug('Base length: ' + bc.length);
      var active_trail_selector = this.options.active_trail_selectors.join(', ');
      this.$menu.find(active_trail_selector).each(function(){
        item = {label: jQuery(this).text(), url: jQuery(this).attr('href')};
        if (!$s.in_array(item, bc)) {
          bc.push(item);
        }
      });
      this.debug('Items length: ' + (bc.length - this.options.base_items.length));
      for (var b in bc) {
        item = bc[b];
        this.add(item.label, item.url, item.options);
      }
      if (dog__sh && dog__sh.bc) {
        this.debug('Custom items length: ' + dog__sh.bc.length);
        this.debug(dog__sh.bc);
        for (var b in dog__sh.bc) {
          item = dog__sh.bc[b];
          if (item.id) {
            this.add_menu_item(item.id, item.options);
          } else {
            this.add(item.label, item.url, item.options);
          }
        }
      }
    }
  };

  this.breadcrumbs = function (options) {
    jQuery.extend(breadcrumbs.options, options);
    breadcrumbs.debug(breadcrumbs.options);
    breadcrumbs.$container = jQuery(breadcrumbs.options.container_selector);
    breadcrumbs.$menu = jQuery(breadcrumbs.options.menu_selector);
    if (breadcrumbs.options.fix_menu_trail) {
      this.fix_menu_trail(breadcrumbs.options.menu_selector);
    }
    return breadcrumbs;
  }

  this.fix_menu_trail = function (menu_selector) {
    menu_selector = menu_selector || '.main-menu';
    var fixed = false;
    var safety_counter = 0;
    while (!fixed) {
      if (safety_counter > 10) {
        return;
      }
      safety_counter++;
      fixed = true;
      jQuery(menu_selector).find('li.current-post-ancestor').each(function(){
        jQuery(this).parents('.menu-item').not('.current-post-ancestor').addClass('current-post-ancestor');
        fixed = false;
      });
    }
  }

}

$d = new dog__base_lib();