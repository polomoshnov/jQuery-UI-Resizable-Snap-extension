/**
 * "jQuery UI Resizable Snap" - Extension to the jQuery UI Resizable plugin for snapping while resizing.
 *
 * @copyright       Copyright 2011, Alexander Polomoshnov
 * @license         MIT license (https://raw.github.com/polomoshnov/jQuery-UI-Resizable-Snap-extension/master/LICENSE.txt)
 * @link            https://github.com/polomoshnov/jQuery-UI-Resizable-Snap-extension
 * @version         1.1
 */
(function ($) {
	$.extend($.ui.resizable.prototype.options, { snapTolerance: 20, snapMode: 'both' });
	
	$.ui.plugin.add('resizable', 'snap', {
		start: function (e, ui) {
			var $this = $(this), inst = $this.data('resizable'), snap = inst.options.snap;
			inst.ow = ui.helper.outerWidth() - ui.size.width;
			inst.oh = ui.helper.outerHeight() - ui.size.height;
			inst.lm = getLm($this);
			inst.tm = getTm($this);
			inst.coords = [];
			
			$(typeof snap == 'string' ? snap : ':data(resizable)').each(function () {
				if (this == inst.element[0] || this == ui.helper[0]) return;
			
				var $el = $(this), p = $el.position(),
					l = p.left + getLm($el), t = p.top + getTm($el);
					
				inst.coords.push({
					l: l, t: t, 
					r: l + $el.outerWidth(), b: t + $el.outerHeight() });
			});
		},
		resize: function (e, ui) {
			var ls = [], ts = [], ws = [], hs = [],
				inst = $(this).data('resizable'),
				axis = inst.axis,
				st = inst.options.snapTolerance,
				md = inst.options.snapMode,
				l = ui.position.left + inst.lm, _l = l - st,
				t = ui.position.top + inst.tm, _t = t - st,
				r = l + ui.size.width + inst.ow, _r = r + st,
				b = t + ui.size.height + inst.oh, _b = b + st;
				
			$.each(inst.coords, function () {
				var w = Math.min(_r, this.r) - Math.max(_l, this.l),
					h = Math.min(_b, this.b) - Math.max(_t, this.t);
					
				if (w < 0 || h < 0) return;

				if (md == 'outer') {
					switch (axis) {
						case 'w': case 'e': if (w > st * 2) return; break;
						case 'n': case 's': if (h > st * 2) return;
					}
				} else if (md == 'inner') {
					switch (axis) {
						case 'w': case 'e': if (w < st * 2) return; break;
						case 'n': case 's': if (h < st * 2) return;
					}
				}
				
				switch (axis) {
					case 'w': ls.push(getC(-(l - this.l), -(l - this.r), st)); break;
					case 'n': ts.push(getC(-(t - this.t), -(t - this.b), st)); break;
					case 'e': ws.push(getC(-(r - this.l), -(r - this.r), st)); break;
					case 's': hs.push(getC(-(b - this.t), -(b - this.b), st));
				}
			});
			
			inst._css = null;
			if (ws.length) {
				inst._css = { width: (ui.size.width += getN(ws)) + inst.ow };		
			} else if (hs.length) {
				inst._css = { height: (ui.size.height += getN(hs)) + inst.oh };
			} else if (ls.length) {
				var n = getN(ls);
				inst._css = { left: (ui.position.left += n), width: (ui.size.width -= n) };
			} else if (ts.length) {
				var n = getN(ts);
				inst._css = { top: (ui.position.top += n), height: (ui.size.height -= n) };
			}
		},
		stop: function (e, ui) {
			var inst = $(this).data('resizable');
			if (inst._helper && inst._css) inst.element.css(inst._css);
		}
	});
	
	function getC(lt, rb, st) {
		return Math.abs(lt) < st ? lt : Math.abs(rb) < st ? rb : 0;
	}
		
	function getN(ar) {
		return ar.sort(function (a, b) { return !a ? 1 : !b ? -1 : Math.abs(a) - Math.abs(b) })[0];
	}
	
	function getLm($el) {
		return parseInt($el.css('margin-left'), 10) || 0;
	}
	
	function getTm($el) {
		return parseInt($el.css('margin-top'), 10) || 0;
	}
})(jQuery);