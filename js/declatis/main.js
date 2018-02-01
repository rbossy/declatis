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
Settings.familiarities = [
	undefined,
	'Low',
	'Moderate',
	'Hight'
];

class WordSet {
	constructor(containerId, adjective, actionButton, extendedPopover) {
		this.containerId = containerId;
		this.adjective = adjective;
		this.actionButton = actionButton;
		this.extendedPopover = extendedPopover;
	}

	get containerElement() {
		return $('#' + this.containerId);
	}

	get words() {
		var result = [];
		$('#' + this.containerId + ' .dismiss-button').each(function(i, e) { result.push($(e).data('word')); });
		return result;
	}

	get count() {
		return $('#' + this.containerId + ' .dismiss-button').length;
	}
}
WordSet.generated = new WordSet(
	'container-generated',
	'generated',
	function(cell, w) {
		cell.append(
			Widget.createDismissButton(w),
			Widget.createValidateButton(w)
		);
	},
	false
);
WordSet.validated = new WordSet(
	'container-validated',
	'generated',
	function(cell, w) {
		cell.append(
			Widget.createDismissButton(w)
		);
	},
	true
);

class Widget {
	static alert(level, message) {
		$('#alert-row').append(
			$('<div class="alert alert-dismissible" role="alert">')
			.addClass('alert-'+level)
			.append(
				$('<span  style="margin-right: 5mm"></span>')
				.append(message),
				$('<button type="button" class="close" data-dismiss="alert"></button>')
				.append('<span>&times;</span>')
			)
			.fadeTo(5000, 1, function() { $(this).fadeOut(500); })
		);
		//'<div class="alert alert-'+level+' alert-dismissible" role="alert">'+message.replace(/\n/g, '<br>')+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
	}

	static error(message) {
		Alert.alert('danger', message);
	}

	static warning(message) {
		Widget.alert('warning', message);
	}

	static clear() {
		$('.alert').remove();
	}

	static updateLengthDisplay(min, max) {
		$('#character-count-badge').text('' + min + '-' + max);
	}

	static updateValidatedCount() {
		$('#validated-count').text(WordSet.validated.count);
	}

	static updateToolButtons(wordSet) {
		var disabled = (wordSet.count === 0);
		$('#' + wordSet.containerId).parent().parent().find(' .btn-tool').prop('disabled', disabled);
	}

	static updateWordSetToolbars() {
		Widget.updateValidatedCount();
		Widget.updateToolButtons(WordSet.generated);
		Widget.updateToolButtons(WordSet.validated);		
	}

	static createDismissAlert(words, message) {
		var undo = $('<a class="btn btn-sm btn-warning icon-reply" data-toggle="tooltip" title="Undo"></a>')
		.data('words', words)
		.click(Action.undoDismiss);
		Widget.warning([message, undo]);
	}

	static displayWords(wordSet, words) {
		var container = wordSet.containerElement;
		container.empty();
		for (var w of words) {
			var cell = Widget.createWordCell(wordSet, w);
			container.append(cell);
		}
	}

	static createWordCell(wordSet, w) {
		var result = $('<div class="p-2 btn-group btn-group-sm w-50" role="group" data-toggle="buttons"></div>')
		.append(
			$('<label class="btn btn-light btn-lg container-fluid word-string"></label>').text(w.cleanString),
			$('<button type="button" class="btn btn-light btn-sm word-status text-secondary"></button>')
			.popover(Widget.createWordPopover(wordSet, w))
			.on('hidden.bs.popover', function() { $('.word-status').removeClass('active'); })
			.append(
				$('<div class="chart" data-percent="'+w.score*150+'"></div>')
				.text('.' + Math.round(w.score*100))
				.easyPieChart(Settings.pieChartProperties)
				)
		);
		wordSet.actionButton(result, w);
		w.wordSet = wordSet;
		return result;
	}

	static createWordPopover(wordSet, w) {
		return {
			title: '<h4>' + w.cleanString + '</h4>',
			html: true,
			content: Widget.createWordPopoverContent(wordSet, w),
			trigger: 'focus',
			placement: 'top',
		}
	}

	static createWordPopoverContent(wordSet, w) {
		var result = '<table><tbody>';
		if (wordSet.extendedPopover) {
			var mark = Widget.getWordPatternMarkovian(w);
			result += Widget.popoverRow('Dictionary', mark.matrix.name);
			result += Widget.popoverRow('Familiarity', Settings.familiarities[mark.k]);
			var fixed = 0;
			var prefix = w.pattern.generators[0].value;
			if (prefix) {
				result += Widget.popoverRow('Prefix', prefix);
				fixed += prefix.length;
			}
			var suffix = w.pattern.generators[w.pattern.generators.length-1].value;
			if (prefix) {
				result += Widget.popoverRow('Suffix', suffix);
				fixed += suffix.len;
			}
			result += Widget.popoverRow('Length', '' + (mark.min+fixed) + '-' + (mark.max+fixed));
		}
		result +=
			Widget.popoverRow('Score', w.score.toFixed(4)) +
			Widget.popoverRow('Mean probability', w.meanProbability.toFixed(2)) +
			(w.kDegradationMean > 0 ? Widget.popoverRow('Degradation', w.kDegradationMean.toFixed(2)) : '') +
			(w.backtrackCount > 0 ? Widget.popoverRow('Backtracks', w.backtrackCount) : '') +
			'</tbody></table>';
		return result;
	}

	static getWordPatternMarkovian(w) {
		for (var gen of w.pattern.generators) {
			if (gen instanceof Markovian) {
				return gen;
			}
		}
	}

	static popoverRow(th, td) {
		return '<tr><th class="word-score">'+th+'</th><td>'+td+'</td></tr>';
	}

	static createDismissButton(w) {
		return $('<button class="btn btn-light btn-sm word-button dismiss-button icon-block text-danger" onclick="Action.dismissWord(this)" data-toggle="tooltip" title="Dismiss word"></button>')
		.data('word', w);
	}

	static createValidateButton(w) {
		return $('<button class="btn btn-light btn-sm word-button icon-check text-success validate-button" onclick="Action.validateWord(this)" data-toggle="tooltip" title="Validate word"></button>')
		.data('word', w)
	}
}

function strlen(s) {
	if (s === undefined) {
		return 0;
	}
	return s.length;
}

class Action {
	static validateWord(button) {
		var w = $(button).data('word');
		var cell = Widget.createWordCell(WordSet.validated, w);
		WordSet.validated.containerElement.prepend(cell);
		$(button).parent().remove();
		Widget.updateWordSetToolbars();
	}

	static validateAll() {
		var words = WordSet.generated.words;
		for (var w of words) {
			var cell = Widget.createWordCell(WordSet.validated, w);
			WordSet.validated.containerElement.prepend(cell);
		}
		$('#' + WordSet.generated.containerId + ' .dismiss-button').parent().remove();
		Widget.updateWordSetToolbars();
	}

	static dismissWord(button) {
		var w = $(button).data('word');
		$(button).parent().remove();
		Widget.updateWordSetToolbars();
		Widget.createDismissAlert([w], 'Dismissed: ' + w.cleanString);
	}

	static dismissAll(wordSet, message) {
		var words = wordSet.words;
		$('#' + wordSet.containerId + ' .dismiss-button').parent().remove();
		Widget.updateWordSetToolbars();
		Widget.createDismissAlert(words, 'Dismissed all ' + wordSet.adjective + ' words');
	}

	static undoDismiss() {
		var words = $(this).data('words');
		for (var w of words) {
			var cell = Widget.createWordCell(w.wordSet, w);
			w.wordSet.containerElement.prepend(cell);
		}
		$(this).parent().alert('close');
		Widget.updateWordSetToolbars();
	}

	static export() {
		var $temp = $("<textarea></textarea>");
		$("body").append($temp);
		var words = WordSet.validated.words;
		var wordStrings = words.map(function(w) { return w.cleanString; });
		$temp.val(wordStrings.join('\n')+'\n').select();
		document.execCommand("copy");
		$temp.remove();
		Widget.alert('success', 'Sent '+WordSet.validated.count+' words to clipboard');
	}

	static generate() {
		var nFixed = strlen(Settings.prefix) + strlen(Settings.suffix);
		app.addDefaultPattern(Settings.dictionary, Settings.k, Settings.min - nFixed, Settings.max - nFixed, Settings.prefix, Settings.suffix);
		app.excludeTrainingWords.push(Dictionary.get(Settings.dictionary).matrix);
		app.generate();
		Widget.updateToolButtons(WordSet.generated);
	}

	static sort(wordSet, order) {
		Widget.displayWords(wordSet, wordSet.words.sort(order));
	}
}


var app = new App({
	WordRejected: function(word, reason) { console.warn('Rejected because ' + reason + ': ' + word.cleanString); },
	GenerationFinished: function(words) { Widget.displayWords(WordSet.generated, words); }
});
app.wordCount = 40;

$(document).ready(function() {
	var slider = $("#character-count").slider();
	slider.on('slideStop', function() { var v = slider.data('slider').getValue(); Settings.setLength(v[0], v[1]); });
	slider.on('change', function() { var v = slider.data('slider').getValue(); Widget.updateLengthDisplay(v[0], v[1]); });

	$('#prefix').val(''); // fix firefox bug

	var dicts = $('#dictionaries');
	for (var d of Dictionary.PRESETS) {
		dicts.append('<a class="dropdown-item" href="#" onclick="Settings.setDictionary(\'' + d.name + '\')">' + d.name + '</a>');
	}

	Settings.setDictionary('French proper names');
});
