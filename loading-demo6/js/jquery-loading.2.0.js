/*
2015.6.12 修改兼容fullpage插件
2015.6.26 修改适应全屏，高度自动居中
2015.6.28 v1.4 检测图片后去除重复图片
2015.7.16 v1.4 autoHeight高度设置问题
2015.7.16 v1.5 min-width问题导致输入input时页面缩小
2015.7.20 v1.6 修正1.5版,修改图片没src时get undefined问题
2015.8.13 v1.7 增加最大页面比例,最小页面比例
2015.9.8  v1.8 修改autoHeight时页面高度增加margin-top;
2015.9.10 v1.8 修改页面最大宽度大于opts.maxWidth时取opts.maxWidth;
2015.11.10 v1.9 修改loadOptions.resize可以在外界手动设置停止
2016.9.12 v2.0 加载动画取消setTimeout使用requestAnimationFrame。
2017.11.28  wsop修改版
*/

; (function ($, undefined) {
	var opts = { //默认配置
		container: ".section",
		slow: false,//开启缓慢显示进度，默认 false
		slowtime: 50,//缓慢显示进度的时间间隔，默认 50
		setRem: true,//使用rem单位
		setWidth: true,//设置最大宽度
		maxWidth: 800,//最大宽度
		maxRadio: 1.625,//最大页面比例
		minRadio: 1.625,//最小页面比例
		radio: 1.625,//页面比例：1300:800
		resize: true,//自适应
		fullpage: false,//是否适应fullpage插件
		autoHeight: false //尽量适应全屏
	}
	loadOptions = window.loadOptions || {};
	if (loadOptions.resize == undefined) {
		loadOptions.resize = true;
	}
	$.extend(opts, loadOptions);
	$.fn.extend({
		loading: function (options) {
			return this.each(function () {
				var imgs = new Array();
				var img = new Array();
				var opt = {
					onload: null,//加载中的回调，每加载完一张图片调用一次
					complete: null//加载完成的回调
				}
				$.extend(opt, opts, options);
				if (!opt.slow) {
					opt.slowtime = 0;
				}
				$(this).find("img").each(function () {
					if ($(this).attr("src")) {
						imgs.push($(this).attr("src"));
					}
				});
				$(this).find("*").each(function () {
					var bgimg = $(this).css("background-image");
					if (bgimg && bgimg != "none") {
						bgimg = bgimg.replace(/[\( \")]/g, "").replace(/url/g, "");
						var bgimgs = bgimg.split(",");
						for (var i = 0; i < bgimgs.length; i++) {
							imgs.push(bgimgs[i]);
						}
					}
				});
				var length = imgs.length;
				var temp = {};
				for (var i = 0; i < length; i++) {//去除重复
					var tmp = imgs[i];
					if (!temp.hasOwnProperty(tmp)) {
						temp[imgs[i]] = "yes";
					}
				}
				imgs = [];
				for (var i in temp) {
					imgs.push(i);
				}
				length = imgs.length;
				var num = 0;
				if (length > 0) {
					for (var i = 0; i < length; i++) {
						img[i] = new Image();
						img[i].onerror = img[i].onload = function () {
							num++;
							this.onload = null;
							this.onerror = null;
						}
						img[i].src = imgs[i];
					}
					var reLength = 0,
						pre = 0,
						reNum = 0,//已加载的个数
						timeOut = null,
						step = function () {
							if (reNum <= num) {
								if (reNum < length) {
									if (reLength >= opt.slowtime / 50) {/*除以50是要适应旧版本*/
										reNum++;
										pre = Math.round((reNum / length) * 100);
										typeof opt.onload == "function" && opt.onload.call(img[reNum - 1], pre);
										reLength = -1;

									}
									reLength++;
								}
							}
							if (reNum < length) {
								timeOut = F.requestAnimationFrame(step);

							} else {
								F.cancelAnimationFrame(timeOut);
								typeof opt.complete == "function" && opt.complete.call(img[reNum - 1], pre);
							}
						}
					step();//开始
				} else {
					if (typeof opt.complete == "function") {
						opt.complete.call(this, pre);
					}
				}
			});
		},
		setRem: function (maxWidth) {
			return this.each(function () {
				var sw = $(this).width();
				if ($(this).hasClass("rotate")) {
					sw = $(this).height();
				}
				var radio = sw / maxWidth > 1 ? 1 : sw / maxWidth;
				var bSize = radio * 100;
				var perSize = bSize + 'px';
				document.documentElement.style.fontSize = perSize;
				//$('html').css('font-size',perSize);
			});
		},
		setWidth: function (opts) {
			return this.each(function () {
				var width = $(window).width();
				var height = $(window).height();
				if (width > opts.maxWidth) {
					width = opts.maxWidth;
				}
				var radio = (height / width) < opts.minRadio ? opts.minRadio : (height / width);
				var setwidth = Math.ceil(height / radio);//比例800:1300 跟设计稿一致
				if (radio <= opts.maxRadio) {
					if (opts.autoHeight) {
						$(this).css({ maxWidth: setwidth + "px", minWidth: setwidth + "px", height: height + (setwidth * (opts.maxRadio - radio)) / 2, marginTop: -(setwidth * (opts.maxRadio - radio)) / 2 + "px" })
						if (radio < (opts.maxRadio + opts.minRadio) / 2) {
							$(this).removeClass("max_margin").addClass("min_margin");
						} else {
							$(this).removeClass("min_margin").addClass("max_margin");
						}
					} else {
						$(this).css({ maxWidth: setwidth + "px", height: height });
					}
					if (opts.fullpage) {
						var active = $(".fullpage-wrapper").find(".active");
						var fullheight = active.height() * active.index();
						$(".fullpage-wrapper").css({ WebkitTransform: "translate3d(0px, -" + fullheight + "px, 0px)", transform: "translate3d(0px, -" + fullheight + "px, 0px)", WebkitTransition: "all 0s ease", transition: "all 0s ease" });
						$(".fp-tableCell,.fp-table").css({ maxWidth: setwidth + "px", height: height });
					}
				} else {
					if (opts.autoHeight) {
						$(this).css({ maxWidth: "none", minWidth: width + "px", height: height, marginTop: "0px" }).removeClass("max_margin min_margin");
					} else {
						$(this).css({ maxWidth: "none", height: height });
					}
					if (opts.fullpage) {
						var active = $(".fullpage-wrapper").find(".active");
						var fullheight = active.height() * active.index();
						$(".fullpage-wrapper").css({ WebkitTransform: "translate3d(0px, -" + fullheight + "px, 0px)", transform: "translate3d(0px, -" + fullheight + "px, 0px)", WebkitTransition: "all 0s ease", transition: "all 0s ease" });
						$(".fp-tableCell,.fp-table").css({ maxWidth: "none", height: height });
					}
				}
			});
		}
	});
	if (opts.setWidth) {
		$(opts.container).setWidth(opts);
	}
	if (opts.setRem) {
		$(opts.container).eq(0).setRem(opts.maxWidth);
	}
	if (opts.resize) {
		var o = navigator.userAgent;
		var isPC = true;
		if (o.indexOf("iPhone") != -1 || o.indexOf("iPad") != -1 || o.indexOf("iPod") != -1 || o.indexOf("Android") != -1 || o.indexOf("SymbianOS") != -1 || o.indexOf("Windows Phone") != -1) {
			isPC = false;
		}
		$(window).resize(function (e) {
			if (isPC || (!isPC && !(document.activeElement && (document.activeElement.type == "text" || document.activeElement.type == "textarea")))) {//防止触发input时屏幕变小
				if (opts.setWidth && loadOptions.resize) {
					$(opts.container).setWidth(opts);
				}
				if (opts.setRem && loadOptions.resize) {
					$(opts.container).eq(0).setRem(opts.maxWidth);
				}
			}
		});
	}
	var F = {
		requestAnimationFrame: function (callback) {
			var lastTime = 0;
			var vendors = ['webkit', 'moz'];
			for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			}
			if (!window.requestAnimationFrame) {
				window.requestAnimationFrame = function (callback, element) {
					var currTime = new Date().getTime();
					var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
					var id = window.setTimeout(function () {
						callback(currTime + timeToCall);
					}, timeToCall);
					lastTime = currTime + timeToCall;
					return id;
				};
			}
			var id = window.requestAnimationFrame(callback);
			return id;
		},
		cancelAnimationFrame: function (id) {
			var lastTime = 0;
			var vendors = ['webkit', 'moz'];
			for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
					window[vendors[x] + 'CancelRequestAnimationFrame'];
			}
			if (!window.cancelAnimationFrame) {
				window.cancelAnimationFrame = function (id) {
					clearTimeout(id);
				};
			}
			window.cancelAnimationFrame(id);
		}
	}
})(jQuery);