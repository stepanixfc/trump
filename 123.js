const input = document.querySelector("input");
const letters = Array.from(document.querySelectorAll("[data-letters]"));
const specs = Array.from(document.querySelectorAll("[data-spec]"));
const textExample = document.querySelector("#textExample");
const symbolsPerMinute = document.querySelector("#symbolsPerMinute");
const errorPercent = document.querySelector("#errorPercent");

const text = `Вы, допустим, воображаете себя человеком сильным и думаете, что вам ничто не угрожает. А между тем случайное освещение предметов в комнате, тон утреннего неба, запах, когда-то любимый вами и навеявший смутные воспоминания, строка забытого стихотворения, которое снова встретилось вам в книге, музыкальная фраза из пьесы, которую вы давно уже не играли, - вот от каких мелочей зависит течение нашей жизни.`;

const party = createParty(text);
init();
function init() {
	input.addEventListener("keydown", keydownHandler);
	input.addEventListener("keyup", keyupHandler);
	viewUpdate();
}
function keydownHandler(event) {
	event.preventDefault();
	const letter = letters.find((x) => x.dataset.letters.includes(event.key));
	if (letter) {
		letter.classList.add("pressed");
		press(event.key);
		return;
	}
	let key = event.key.toLowerCase();
	if (key === " ") {
		key = "space";
		press(" ");
	}
	if (key === "enter") {
		press("\n");
	}
	const ownSpecs = specs.filter((x) => x.dataset.spec === key);
	if (ownSpecs.length) {
		ownSpecs.forEach((spec) => spec.classList.add("pressed"));
		return;
	}
	console.warn("Не известный вид клавиши.", event);
}
function keyupHandler(event) {
	event.preventDefault();
	const letter = letters.find((x) => x.dataset.letters.includes(event.key));
	if (letter) {
		letter.classList.remove("pressed");
		return;
	}
	let key = event.key.toLowerCase();
	if (key === " ") {
		key = "space";
	}
	const ownSpecs = specs.filter((x) => x.dataset.spec === key);
	if (ownSpecs.length) {
		ownSpecs.forEach((spec) => spec.classList.remove("pressed"));
		return;
	}
}
function createParty(text) {
	const party = {
		text,
		strings: [],
		maxStringLength: 70,
		maxShowStrings: 3,
		currentStringIndex: 0,
		currentPressedIndex: 0,
		errors: [],
		started: false,

		statisticFlag: false,
		timerCounter: 0,
		startTimer: 0,
		errorCounter: 0,
		commonCounter: 0,
	};

	party.text = party.text.replace(/\n/g, "\n ");
	const words = party.text.split(" ");
	let string = [];
	for (const word of words) {
		const newStringLength =
			[...string, word].join(" ").length + !word.includes("\n");
		if (newStringLength > party.maxStringLength) {
			party.strings.push(string.join(" ") + " ");
			string = [];
		}
		string.push(word);
		if (word.includes("\n")) {
			party.strings.push(string.join(" "));
			string = [];
		}
	}
	if (string.length) {
		party.strings.push(string.join(" "));
	}
	return party;
}

function press(letter) {
	

	const string = party.strings[party.currentStringIndex];
	const mustLetter = string[party.currentPressedIndex];
    console.log(letter, mustLetter);
	if (letter === mustLetter) {
		party.currentPressedIndex++;
		if (string.length <= party.currentPressedIndex) {
			party.currentPressedIndex = 0;
			party.currentStringIndex++;

			party.statisticFlag = false;
			party.timerCounter = Date.now() - party.startTimer;
		}
	} else if (!party.errors.includes(mustLetter)) {
		party.errors.push(mustLetter);
		
	}

	

	viewUpdate();
}

function viewUpdate() {
	const string = party.strings[party.currentStringIndex];
	const showedStrings = party.strings.slice(
		party.currentStringIndex,
		party.currentStringIndex + party.maxShowStrings
	);
	const div = document.createElement("div");
	const firstLine = document.createElement("div");
	firstLine.classList.add("line");
	div.append(firstLine);
	const done = document.createElement("span");
	done.classList.add("done");
	done.textContent = string.slice(0, party.currentPressedIndex);
	
    firstLine.append(
		done,...string.slice(party.currentPressedIndex).split("").map((letter) => {
				if (letter === " ") {
					return "·";
				}
				if (letter === "\n") {
					return "¶";
				}
				if (party.errors.includes(letter)) {
					const errorSpan = document.createElement("span");
					errorSpan.classList.add("hint");
					errorSpan.textContent = letter;
					return errorSpan;
				}
				return letter;
			})
	);
	for (let i = 1; i < showedStrings.length; i++) {
		const line = document.createElement("div");
		line.classList.add("line");
		div.append(line);
		line.append(
			...showedStrings[i].split("").map((letter) => {
				if (letter === " ") {
					return "·";
				}
				if (letter === "\n") {
					return "¶";
				}
				if (party.errors.includes(letter)) {
					const errorSpan = document.createElement("span");
					errorSpan.classList.add("hint");
					errorSpan.textContent = letter;
					return errorSpan;
				}
				return letter;
			})
		);
	}
	textExample.innerHTML = "";
	textExample.append(div);

	input.value = string.slice(0, party.currentPressedIndex);

	if (!party.statisticFlag && party.started) {
		symbolsPerMinute.textContent = Math.round(
			(60000 * party.commonCounter) / party.timerCounter
		);

		errorPercent.textContent =
			Math.floor((10000 * party.errorCounter) / party.commonCounter) / 100 +
			"%";
	}
}