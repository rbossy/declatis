class Action {
	static setK(k) {
		Action.k = k;
		Action.update();
	}

	static setLength(min, max) {
		if (min === Action.min && max === Action.max) {
			return;
		}
		if (min === max) {
			return; //
		}
		Action.min = min;
		Action.max = max;
		console.log(min);
		console.log(max);
		Action.update();
	}

	static setDictionary(name) {
		Action.dictionary = name;
		$('#current-dictionary').text(name);
		Action.update();
	}

	static setPrefix(prefix) {
		if (prefix === undefined) {
			prefix = $('#prefix').val();
		}
		prefix = prefix.trim();
		if (prefix === '') {
			prefix = undefined;
		}
		if (prefix === Action.prefix) {
			return;
		}
		Action.prefix = prefix;
		Action.update();
	}

	static setSuffix(suffix) {
		if (suffix === undefined) {
			suffix = $('#suffix').val();
		}
		suffix = suffix.trim();
		if (suffix === '') {
			suffix = undefined;
		}
		if (suffix === Action.suffix) {
			return;
		}
		Action.suffix = suffix;
		Action.update();
	}

	static _len(s) {
		if (s === undefined) {
			return 0;
		}
		return s.length;
	}

	static update() {
		var nFixed = Action._len(Action.prefix) + Action._len(Action.suffix);
		app.addDefaultPattern(Action.dictionary, Action.k, Action.min - nFixed, Action.max - nFixed, Action.prefix, Action.suffix);
		app.excludeTrainingWords.push(Dictionary.get(Action.dictionary).matrix);
		app.generate();
	}

	static displayWords() {
		var tab = $('#generated-words');
		tab.empty();
		for (var i = 0; i < Action.words.length; i += Action.cols) {
			var row = $('<tr></tr>');
			for (var c = 0; c < Action.cols; ++c) {
				row.append(Action.wordAsCell(i + c));
			}
			tab.append(row);
		}
		$('.chart').easyPieChart({
			size: 20,
			lineWidth: 2,
			trackColor: '#DDDDDD',
			scaleColor: false,
			barColor: '#444444'
		});
	}

	static wordAsCell(i) {
		var result = $('<td></td>');
		if (i < Action.words.length) {
			var w = Action.words[i];
			var s = w.cleanString;
			var cell = $('<div class="btn-group container-fluid btn-group-sm" role="group" data-toggle="buttons"></div>').append(
				$('<label class="btn btn-light container-fluid btn-lg word-string"></label>').
				append(
					'<input type="checkbox" onchange="Action.updateSelected()" autocomplete="off">',
					s
				),
				$('<button type="button" class="btn btn-light btn-sm word-status text-secondary"></button>')
				.popover({
					title: '<h4>' + w.cleanString + '</h4>',
					html: true,
					content: (
						'<table><tbody>'+
						'<tr><th class="word-score">Score</th><td>'+w.score.toFixed(4)+'</td></tr>'+
						'<tr><th class="word-score">Mean probability</th><td>'+w.meanProbability.toFixed(2)+'</td></tr>'+
						(w.kDegradationMean > 0 ? '<tr><th class="word-score">Degradation</th><td>'+w.kDegradationMean.toFixed(2)+'</td></tr>' : '')+
						(w.backtrackCount > 0 ? '<tr><th class="word-score">Backtracks</th><td>'+w.backtrackCount+'</td></tr>' : '')+
						'</tbody></table>'
						),
					trigger: 'focus',
					placement: 'top',
				})
				.on('hidden.bs.popover', function() { $('.word-status').removeClass('active'); })
				.append('<div class="chart" data-percent="'+w.score*150+'">.'+Math.round(w.score*100)+'</div>')
				,
			);
			result.append(cell);
		}
		return result;
	}

	static sort(order) {
		Action.words.sort(order);
		Action.displayWords();
	}

	static ORDER_SCORE(a, b) {
		return b.score - a.score;
	}

	static ORDER_LENGTH(a, b) {
		return a.length - b.length;
	}

	static ORDER_ALPHA(a, b) {
		var as = a.cleanString;
		var bs = b.cleanString;
		if (as < bs) {
			return -1;
		}
		if (as > bs) {
			return 1;
		}
		return 0;
	}

	static countSelectedWords() {
		return $('.word-string input:checked').length;
	}

	static updateSelected() {
		var n = Action.countSelectedWords();
		if (n == 0) {
			$('#selected-words').css('display', 'none');
			$('#btn-export').attr('disabled', true);
		}
		else {
			$('#selected-words').css('display', 'inline-block').text(n);
			$('#btn-export').attr('disabled', false);
		}
	}

	static selectAll() {
		$('.word-string input').prop('checked', true);
		$('.word-string').addClass('active');
		Action.updateSelected();
	}

	static selectNone() {
		$('.word-string input').prop('checked', false);
		$('.word-string').removeClass('active');
		Action.updateSelected();
	}

	static selectedWordsArray() {
		var result = [];
		$('.word-string input:checked').each(function(i, e) { result.push(e.parentNode.textContent); });
		return result;
	}

	static export() {
		var $temp = $("<textarea></textarea>");
		$("body").append($temp);
		$temp.val(Action.selectedWordsArray().join('\n')).select();
		document.execCommand("copy");
		$temp.remove();
		$('#alerts').prepend('<div class="row alert alert-success alert-dismissible" role="alert">Sent '+Action.countSelectedWords()+' words to clipboard. Paste them in your favourite application.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
		window.setTimeout(function() {
			$(".alert").fadeTo(500, 0).slideUp(500, function(){
				$(this).remove(); 
			});
		}, 4000);
	}

	static setLengthDisplay(min, max) {
		$('#character-count-badge').text('' + min + '-' + max);
	}
}
Action.k = 2;
Action.min = 6;
Action.max = 10;
Action.dictionary = 'French proper names';
Action.prefix = undefined;
Action.suffix = undefined;
Action.words = undefined;
Action.cols = 4;

var app = new App({
	WordRejected: function(word, reason) { console.warn('Rejected because ' + reason + ': ' + word.cleanString); },
	GenerationFinished: function(words) { Action.words = words; Action.displayWords(); }
});
app.wordCount = 40;

$(document).ready(function() {
	var slider = $("#character-count").slider();
	slider.on('slideStop', function() { var v = slider.data('slider').getValue(); Action.setLength(v[0], v[1]); });
	slider.on('change', function() { var v = slider.data('slider').getValue(); Action.setLengthDisplay(v[0], v[1]); });

	var dicts = $('#dictionaries');
	for (var d of Dictionary.PRESETS) {
		dicts.append('<a class="dropdown-item" href="#" onclick="Action.setDictionary(\'' + d.name + '\')">' + d.name + '</a>');
	}

	Action.setDictionary('French proper names');
});
