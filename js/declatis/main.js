class Settings {
	static setK(k) {
		Settings.k = k;
		NewAction.generate();
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
		NewAction.generate();
	}

	static setDictionary(name) {
		Settings.dictionary = name;
		$('#current-dictionary').text(name);
		NewAction.generate();
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
		NewAction.generate();
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
		NewAction.generate();
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
		return $('<button class="btn btn-light btn-sm word-button icon-block text-danger" onclick="NewAction.dismissWord(this)" data-toggle="tooltip" title="Dismiss word"></button>');
	}
}
WordSet.generated = new WordSet(
	'container-generated',
	2,
	function(cell, w) {
		cell.append(
			WordSet.dismissButton(),
			$('<button class="btn btn-light btn-sm word-button icon-check text-success" onclick="NewAction.validateWord(this)" data-toggle="tooltip" title="Validate word"></button>')
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
	static _len(s) {
		if (s === undefined) {
			return 0;
		}
		return s.length;
	}

	static update() {
		var nFixed = Action._len(Settings.prefix) + Action._len(Settings.suffix);
		app.addDefaultPattern(Settings.dictionary, Settings.k, Settings.min - nFixed, Settings.max - nFixed, Settings.prefix, Settings.suffix);
		app.excludeTrainingWords.push(Dictionary.get(Settings.dictionary).matrix);
		app.generate();
	}

	static displayWords() {
		var tab = $('#generated-words');
		tab.empty();
		for (var i = 0; i < WordSet.generated.length; i += Settings.cols) {
			var row = $('<tr></tr>');
			for (var c = 0; c < Settings.cols; ++c) {
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
		if (i < WordSet.generated.length) {
			var w = WordSet.generated[i];
			var s = w.cleanString;
			var cell = 
				$('<div class="btn-group container-fluid btn-group-sm" role="group" data-toggle="buttons"></div>').append(
					$('<label class="btn btn-light container-fluid btn-lg word-string'+(w.selected ? ' active' : '')+'"></label>').append(
						$('<input type="checkbox" onchange="Action.select(this)" autocomplete="off">').data('word', w).prop('checked', w.selected),
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
		WordSet.generated.sort(order);
		Action.displayWords();
	}

	static select(elt) {
		var j = $(elt);
		j.data('word').selected = j[0].checked;
		NewAction.generateSelected();
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
		NewAction.generateSelected();
	}

	static selectNone() {
		$('.word-string input').prop('checked', false);
		$('.word-string').removeClass('active');
		NewAction.generateSelected();
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

class NewAction {
	static validateWord(button) {
		var w = $(button).data('word');
		var cell = NewAction.createWordCell(WordSet.validated, w);
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
		var nFixed = NewAction._len(Settings.prefix) + NewAction._len(Settings.suffix);
		app.addDefaultPattern(Settings.dictionary, Settings.k, Settings.min - nFixed, Settings.max - nFixed, Settings.prefix, Settings.suffix);
		app.excludeTrainingWords.push(Dictionary.get(Settings.dictionary).matrix);
		app.generate();
	}

	static sort(wordSet, order) {
		NewAction.displayWords(wordSet, wordSet.words.sort(order));
	}

	static displayWords(wordSet, words) {
		var table = wordSet.tableElement;
		table.empty();
		for (var i = 0; i < words.length; i += wordSet.cols) {
			for (var j = 0; j < wordSet.cols; ++j) {
				var w = words[i + j];
				if (w != undefined) {
					var cell = NewAction.createWordCell(wordSet, w);
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
			.popover(NewAction.createWordPopover(w))
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
	GenerationFinished: function(words) { NewAction.displayWords(WordSet.generated, words); }
});
app.wordCount = 40;

$(document).ready(function() {
	var slider = $("#character-count").slider();
	slider.on('slideStop', function() { var v = slider.data('slider').getValue(); Settings.setLength(v[0], v[1]); });
	slider.on('change', function() { var v = slider.data('slider').getValue(); Action.setLengthDisplay(v[0], v[1]); });

	var dicts = $('#dictionaries');
	for (var d of Dictionary.PRESETS) {
		dicts.append('<a class="dropdown-item" href="#" onclick="Action.setDictionary(\'' + d.name + '\')">' + d.name + '</a>');
	}

	Settings.setDictionary('French proper names');
});
