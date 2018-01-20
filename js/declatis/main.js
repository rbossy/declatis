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

	static displayWords(words, cols=4) {
		var tab = $('#generated-words');
		tab.empty();
		for (var i = 0; i < words.length; i += cols) {
			var row = $('<tr></tr>');
			for (var c = 0; c < cols; ++c) {
				row.append(Action.wordAsCell(words, i + c));
			}
			tab.append(row);
		}
	}

	static wordAsCell(words, i) {
		var result = $('<td></td>');
		if (i < words.length) {
			var w = words[i];
			var s = w.cleanString;
			var cell = $('<div class="btn-group container-fluid btn-group-sm" role="group" data-toggle="buttons"></div>').append(
				$('<label class="btn btn-light container-fluid"><input type="checkbox" class="word-string" onchange="Action.updateSelected()" autocomplete="off">'+s+'</label>'),
				$('<button type="button" class="btn btn-light"></button>').popover({
					title: '<h4>' + w.cleanString + '</h4>',
					html: true,
					content: (
						'<table><tbody>'+
						'<tr><th class="word-score">Score</th><td>'+w.score.toFixed(4)+'</td></tr>'+
						'<tr><th class="word-score">Mean probability</th><td>'+w.meanProbability.toFixed(2)+'</td></tr>'+
						(w.kDegradationMean > 0 ? '<tr class="text-warning"><th class="word-score">Degradation</th><td>'+w.kDegradationMean.toFixed(2)+'</td></tr>' : '')+
						(w.backtrackCount > 0 ? '<tr class="text-warning"><th class="word-score">Backtracks</th><td>'+w.backtrackCount+'</td></tr>' : '')+
						'</tbody></table>'
						),
					trigger: 'focus',
					placement: 'top',
				}).append($('<span></span>').addClass(w.kDegradationMean + w.backtrackCount > 0 ? 'icon-warning text-warning' : 'icon-info text-success')),
			);
			result.append(cell);
		}
		return result;
	}

	static updateSelected() {
		$('#selected-words').text($('.word-string:checked').length);
	}
}
Action.k = 2;
Action.min = 6;
Action.max = 10;
Action.dictionary = 'French proper names';

var app = new App({
	WordRejected: function(word, reason) { console.warn('Rejected because ' + reason + ': ' + word.cleanString); },
	GenerationFinished: Action.displayWords,
});
app.wordCount = 40;

$(document).ready(function() {
	var slider = $("#character-count").slider().data('slider');
	slider.on('slide', function() { Action.setLength(slider.getValue()[0], slider.getValue()[1]); });

	var dicts = $('#dictionaries');
	for (var d of Dictionary.PRESETS) {
		dicts.append('<a class="dropdown-item" href="#" onclick="Action.setDictionary(\'' + d.name + '\')">' + d.name + '</a>');
	}

	Action.setDictionary('French proper names');
});
