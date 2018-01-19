var app = new App({
	WordRejected: function(word, reason) { console.warn('Rejected because ' + reason + ': ' + word.cleanString); },
	GenerationFinished: function(words) {
		words.sort(Word.SCORE_COMPARATOR).reverse();
		var tab = $('#generated-words');
		tab.empty();
		var cols = 3;
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
			var cell = $('<a class="generated-word" href="#">'+w.cleanString+'</a>');
			result.append(cell);
			cell.popover({
				title: w.cleanString,
				html: true,
				content: '<table><tbody><tr><th><a href="http://www.google.com/search?q='+w.cleanString+'" target="_new">Search</a></th></tr><tr><th>Score</th><td>'+w.score.toFixed(4)+'</td></tr></tbody></table>',
				trigger: 'focus',
				placement: 'top',
			});
			cell.on('show.bs.popover', function() { $('.generated-word').popover('hide'); })
		}
		return result;
	}
});

class Action {
	static setK(k) {
		Action.k = k;
		Action.update();
	}

	static setLength(min, max) {
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
