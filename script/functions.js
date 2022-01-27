//рандом
function randomInteger(min, max) {
	// случайное число от min до (max+1)
	let rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}

// скрыть элемент
function hide(elemClass) {
	document.querySelector('.' + elemClass).style.display = 'none';
}
// показать элемент
function show(elemClass) {
	document.querySelector('.' + elemClass).style.display = 'flex';
}

// показать только конккретный слайд
function showSlide(selector) {
	document.querySelectorAll('.game__slide').forEach(slide => {
		if (slide.classList.contains(selector)) {
			slide.style.display = 'flex';
		} else {
			slide.style.display = 'none';
		}
	})
	// для загрузки
	if (selector == 'endgame') {
			document.querySelector('.game__loading').classList.add('game__loading_dark');
	} else {
		document.querySelector('.game__loading').classList.remove('game__loading_dark');
	}
}
// показать конкретные ДОПы, остальные скрыть
function showAdditions(...selectors) {
	document.querySelectorAll('.game__addition').forEach(slide => {
		let visible = false;
		selectors.forEach(sel => {
			if (slide.classList.contains(sel)) {
				console.log(sel);
				slide.style.display = 'flex';
				visible = true;
			} else {
				if (!visible) {
					slide.style.display = 'none';
				}
			}
		})
		
	})
}
// показать ДОПу
function showAddition(selector) {
	document.querySelectorAll('.game__addition').forEach(slide => {
		if (slide.classList.contains(selector)) {
			slide.style.display = 'flex';
		}
	})
}

// анимация загрузки
function loading(isLoading = true) {
	if (isLoading) {
		document.querySelector('.game__loading').style.display = 'flex';
	} else {
		document.querySelector('.game__loading').style.display = 'none';
	}
}

// JSONP
function jsonp(uri) {
	return new Promise(function(resolve, reject) {
		var id = '_' + Math.round(10000 * Math.random());
		var callbackName = 'jsonp_callback_' + id;
		window[callbackName] = function(data) {
			delete window[callbackName];
			var ele = document.getElementById(id);
			ele.parentNode.removeChild(ele);
			resolve(data);
		}

		var src = uri + '&callback=' + callbackName;
		var script = document.createElement('script');
		script.src = src;
		script.id = id;
		script.addEventListener('error', reject);
		(document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script)
	});
}

// запрос к api
async function request(type, id) {
	let request = await jsonp(`https://api.deezer.com/${type}/${id}&output=jsonp`).then(function(data){
		return data;
	});
	console.log(request);
	return request;
}



// перемешивание массива и возвращение нового
function shuffleNew(array) {
	let thisArr = [...array];
  for (let i = thisArr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [thisArr[i], thisArr[j]] = [thisArr[j], thisArr[i]];
  }
  return thisArr;
}
// перемешивание массива на месте
function shuffle(thisArr) {
  for (let i = thisArr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [thisArr[i], thisArr[j]] = [thisArr[j], thisArr[i]];
  }
}
// рандомайзер
function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}



function showMenu() {
	let slides = ['test', 'loadscreen', 'mode', 'genre', 'playlist', 'round', 'endround', 'endgame'];
	slides.forEach(item => {
		document.querySelector('.game-menu__inner').insertAdjacentHTML('beforeend', `<div class="game-menu__item">${item}</div>`);
		document.querySelector('.game-menu__inner').lastChild.addEventListener('click', function() {
			let text = this.innerHTML;
			console.log(this);
			showSlide(text);
		})
	})
}

/// test duration
function durationCheck(tracklist) {
	let audio = new Audio();
	let arrLow = [];
	tracklist.forEach(function(track, index) {
		audio = new Audio(track.preview);
		audio.addEventListener("loadeddata", function() {
 			if (this.duration < 15) {
 				console.log('low duration: ' + index);
 				arrLow.push(index);
 			} else {
 				console.log('good ');
 			}
		});
	})
	if (arrLow.length == 0) {
		console.log('Все больше 15 секунд');
	} else {
		console.log(arrLow);
	}
}