class Slot {
	constructor(generator, char, probability, kDegradation = undefined) {
		this.generator = generator;
		this.char = char;
		this.probability = probability;
		this.kDegradation = kDegradation;
		this.backtrackCount = undefined;
	}

	get score() {
		var result = this.probability / (this.kDegradation + 1);
		if (this.backtrackCount !== undefined) {
			result *= (this.generator.maxBacktracks - this.backtrackCount) / this.generator.maxBacktracks;
		}
		return result;
	}
}

class Word {
	constructor(pattern) {
		this.pattern = pattern;
		this.slots = [];
	}

	get length() {
		return this.slots.length;
	}

	backtrack(n) {
		this.slots.splice(n);
	}

	get rawString() {
		return this.slots.map(function(slot) { return slot.char; }).join('');
	}

	get cleanString() {
		return this.rawString.replace(Matrix.SEPARATOR_CHAR, ' ').replace(Matrix.START_CHAR, '').replace(Matrix.END_CHAR, '');
	}

	get scoredString() {
		return this.score.toFixed(4) + ' ' +
		this.meanProbability.toFixed(2) + ' ' +
		this.kDegradationMean.toFixed(2) + ' ' +
		this.backtrackCount + ' ' +
		this.cleanString;
	}

	get _kDegradation() {
		var slots = 0;
		var total = 0;
		for (var slot of this.slots) {
			if (slot.kDegradation !== undefined) {
				slots++;
				total += slot.kDegradation;
			}
		}
		return [slots, total];
	}

	get kDegradation() {
		return this._kDegradation[1];
	}

	get kDegradationMean() {
		var kd = this._kDegradation;
		return kd[1] / kd[0];
	}

	get _backtrackCount() {
		var slots = 0;
		var total = 0;
		for (var slot of this.slots) {
			if (slot.backtrackCount !== undefined) {
				slots++;
				total += slot.backtrackCount;
			}
		}
		return [slots, total];
	}

	get backtrackCount() {
		return this._backtrackCount[1];
	}

	get backtrackMean() {
		var bt = this._backtrackCount;
		return bt[1] / bt[0];
	}

	get probability() {
		var result = 1;
		for (var slot of this.slots) {
			result *= slot.probability;
		}
		return result;
	}

	get meanProbability() {
		var sum = 0;
		var n = 0;
		for (var slot of this.slots) {
			if (slot.probability < 1) {
				sum += slot.probability;
				n += 1;
			}
		}
		return sum / n;
	}

	get score() {
		var sum = 0;
		var n = 0;
		for (var slot of this.slots) {
			if (slot.generator instanceof Markovian) {
				sum += slot.score;
				n += 1;
			}
		}
		return (sum / n);
	}

	last(n) {
		var start = Math.max(0, this.slots.length - n);
		return this.slots.slice(start);
	}

	add(slot) {
		this.slots.push(slot);
	}

	static MEAN_PROBABILITY_COMPARATOR(a, b) {
		return a.meanProbability - b.meanProbability;
	}

	static SCORE_COMPARATOR(a, b) {
		return a.score - b.score;
	}
}
