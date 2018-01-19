var app = new App({
	WordRejected: function(word, reason) { console.warn('Rejected because ' + reason + ': ' + word.cleanString); },
	GenerationFinished: function(words) {
		words.sort(Word.SCORE_COMPARATOR).reverse();
		var tab = $('#generated-words');
		tab.empty();
		var cols = 4;
		for (var i = 0; i < words.length; i += cols) {
			var row = $('<tr></tr>');
			for (var c = 0; c < cols; ++c) {
				row.append(this._wordAsCell(words, i + c));
			}
			tab.append(row);
		}
	},
	_wordAsCell: function(words, i) {
		var result = $('<td></td>');
		if (i < words.length) {
			var w = words[i];
			result.text(w.cleanString);
			result.popover({
				title: '<h4>' + w.cleanString + '</h4>',
				html: true,
				content: (
					'<table><tbody>'+
					'<tr><th class="score">Score</th><td>'+w.score.toFixed(4)+'</td></tr>'+
					'<tr><th class="score">Mean probability</th><td>'+w.meanProbability.toFixed(2)+'</td></tr>'+
					'<tr><th class="score">Degradation</th><td>'+w.kDegradationMean.toFixed(2)+'</td></tr>'+
					'<tr><th class="score">Backtracks</th><td>'+w.backtrackCount+'</td></tr>'+
					'</tbody></table>'
					),
				trigger: 'hover',
				placement: 'top',
			});
		}
		return result;
	}
});
app.wordCount = 40;

class Action {
	static setK(k) {
		Action.k = k;
		Action.update();
	}

	static setLength(min, max) {
		if (min == Action.min && max == Action.max) {
			return;
		}
		Action.min = min;
		Action.max = max;
		Action.update();
	}

	static setDictionary(name) {
		Action.dictionary = name;
		$('#current-dictionary').text(name);
		Action.update();
	}

	static update() {
		app.addDefaultPattern(Action.dictionary, Action.k, Action.min, Action.max);
		app.excludeTrainingWords.push(Dictionary.get(Action.dictionary).matrix);
		app.generate();
	}
}
Action.k = 2;
Action.min = 6;
Action.max = 10;
Action.dictionary = 'French proper names';

$(document).ready(function() {
	var slider = $("#character-count").slider().data('slider');
	slider.on('slide', function() { Action.setLength(slider.getValue()[0], slider.getValue()[1]); });

	var dicts = $('#dictionaries');
	for (var d of Dictionary.PRESETS) {
		dicts.append('<a class="dropdown-item" href="#" onclick="Action.setDictionary(\'' + d.name + '\')">' + d.name + '</a>');
	}

	Action.setDictionary('French proper names');
});
