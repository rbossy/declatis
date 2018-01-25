class Settings {
	static setK(k) {
		Settings.k = k;
		Action.generate();
	}

	static setLength(min, max) {
		if (min === Settings.min && max === Settings.max) {
			return;
		}
		if (min === max) {
			return; //
		}
		Settings.min = min;
		Settings.max = max;
		Action.generate();
	}

	static setDictionary(name) {
		Settings.dictionary = name;
		$('#current-dictionary').text(name);
		Action.generate();
	}

	static setPrefix(prefix) {
		if (prefix === undefined) {
			prefix = $('#prefix').val();
		}
		prefix = prefix.trim();
		if (prefix === '') {
			prefix = undefined;
		}
		if (prefix === Settings.prefix) {
			return;
		}
		Settings.prefix = prefix;
		Action.generate();
	}

	static setSuffix(suffix) {
		if (suffix === undefined) {
			suffix = $('#suffix').val();
		}
		suffix = suffix.trim();
		if (suffix === '') {
			suffix = undefined;
		}
		if (suffix === Settings.suffix) {
			return;
		}
		Settings.suffix = suffix;
		Action.generate();
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
}
Settings.pieChartProperties =
{
	size: 20,
	lineWidth: 2,
	trackColor: '#DDDDDD',
	scaleColor: false,
	barColor: '#444444'
};
Settings.k = 2;
Settings.min = 6;
Settings.max = 10;
Settings.dictionary = 'French proper names';
Settings.prefix = undefined;
Settings.suffix = undefined;
Settings.cols = 4;

class WordSet {
	constructor(tableId, cols, actionButton) {
		this.tableId = tableId;
		this.cols = cols;
		this.actionButton = actionButton;
	}

	get tableElement() {
		return $('#' + this.tableId);
	}

	get words() {
		var result = [];
		$('#' + this.tableId + ' .word-button').each(function(i, e) { result.push($(e).data('word')); });
		return result;
	}

	static dismissButton() {
		return $('<button class="btn btn-light btn-sm word-button icon-block text-danger" onclick="Action.dismissWord(this)" data-toggle="tooltip" title="Dismiss word"></button>');
	}
}
WordSet.generated = new WordSet(
	'container-generated',
	2,
	function(cell, w) {
		cell.append(
			WordSet.dismissButton(),
			$('<button class="btn btn-light btn-sm word-button icon-check text-success" onclick="Action.validateWord(this)" data-toggle="tooltip" title="Validate word"></button>')
			.data('word', w)
		);
	}
);
WordSet.validated = new WordSet(
	'container-validated',
	2,
	function(cell, w) {
		cell.append(
			WordSet.dismissButton()
		);
	}
);

class Action {
	static setLengthDisplay(min, max) {
		$('#character-count-badge').text('' + min + '-' + max);
	}

	static validateWord(button) {
		var w = $(button).data('word');
		var cell = Action.createWordCell(WordSet.validated, w);
		WordSet.validated.tableElement.prepend(cell);
		$(button).parent().remove();
	}

	static dismissWord(button) {
		$(button).parent().remove();
	}

	static _len(s) {
		if (s === undefined) {
			return 0;
		}
		return s.length;
	}

	static generate() {
		var nFixed = Action._len(Settings.prefix) + Action._len(Settings.suffix);
		app.addDefaultPattern(Settings.dictionary, Settings.k, Settings.min - nFixed, Settings.max - nFixed, Settings.prefix, Settings.suffix);
		app.excludeTrainingWords.push(Dictionary.get(Settings.dictionary).matrix);
		app.generate();
	}

	static sort(wordSet, order) {
		Action.displayWords(wordSet, wordSet.words.sort(order));
	}

	static displayWords(wordSet, words) {
		var table = wordSet.tableElement;
		table.empty();
		for (var i = 0; i < words.length; i += wordSet.cols) {
			for (var j = 0; j < wordSet.cols; ++j) {
				var w = words[i + j];
				if (w != undefined) {
					var cell = Action.createWordCell(wordSet, w);
					table.append(wordSet, cell);
				}
			}
		}
	}

	static createWordCell(wordSet, w) {
		var result = $('<div class="p-2 btn-group btn-group-sm w-50" role="group" data-toggle="buttons"></div>')
		.append(
			$('<label class="btn btn-light btn-lg container-fluid word-string"></label>').text(w.cleanString),
			$('<button type="button" class="btn btn-light btn-sm word-status text-secondary"></button>')
			.popover(Action.createWordPopover(w))
			.append(
				$('<div class="chart" data-percent="'+w.score*150+'"></div>')
				.text('.' + Math.round(w.score*100))
				.easyPieChart(Settings.pieChartProperties)
				)
		);
		wordSet.actionButton(result, w);
		return result;
	}

	static createWordPopover(w) {
		return {
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
		}
	}
}


var app = new App({
	WordRejected: function(word, reason) { console.warn('Rejected because ' + reason + ': ' + word.cleanString); },
	GenerationFinished: function(words) { Action.displayWords(WordSet.generated, words); }
});
app.wordCount = 40;

$(document).ready(function() {
	var slider = $("#character-count").slider();
	slider.on('slideStop', function() { var v = slider.data('slider').getValue(); Settings.setLength(v[0], v[1]); });
	slider.on('change', function() { var v = slider.data('slider').getValue(); Action.setLengthDisplay(v[0], v[1]); });

	var dicts = $('#dictionaries');
	for (var d of Dictionary.PRESETS) {
		dicts.append('<a class="dropdown-item" href="#" onclick="Settings.setDictionary(\'' + d.name + '\')">' + d.name + '</a>');
	}

	Settings.setDictionary('French proper names');
});
