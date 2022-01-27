const game = {
	base: bd,									// бд с треками
	tracklist: [],								// треклист с объектами треков из DZ
	position: 0,								// текущий индекс трека
	trackCounter: 0,							// количество проигранных треков
	indexOfTrue: false,							// индекс правильного ответа
	song: document.querySelector('.audio'),		// аудио
	correct: false,								// правильный ответ
	timer: 0,									// переменная с settimeout
	isTimer: false,								// активен ли timerout
	counter: 0,									// счетчик правильных ответов
	passCounter: 0,								// счетчик пропущенных мелодий
	type: '',									// режим игры (жанр, плейлист, моя музыка)
	mode: 'song', 								// режим артисты или песни
	easyMode: false,							// легкий режим
	oneclick: true,								// с первого ли клика угадал пользователь(для изи мода)

	
	// бинды
	bindMode() {
		// кнопки выбора режима
		document.querySelector('.mode__genre').addEventListener('click',function() {
			hide('program-panel');
			showSlide('genre');
			carousel.add('.genre__carousel', 2, 1, true);
		})
		document.querySelector('.mode__playlist').addEventListener('click',function() {
			hide('program-panel');
			showSlide('playlist');
			carousel.add('.playlist__carousel', 2, 1, true);
		})
		document.querySelector('.mode__mymusic').addEventListener('click',function() {
			hide('program-panel');
			showSlide('my-playlist');
		})

		// загрузить свой плейлист
		document.querySelector('.my-playlist__go').addEventListener('click', function() {
			let url = document.querySelector('.my-playlist__input').value;
			if (url.indexOf('/playlist/') == -1 || url.indexOf('deezer') == -1) {
				// если ссылка неправильная
				document.querySelector('.my-playlist__input').value = ''
				document.querySelector('.my-playlist__error').style.display = 'flex';
			} else {
				let modifiedUrl = url.slice(url.indexOf('/playlist/') + 10);
				console.log(modifiedUrl);
				if (modifiedUrl.indexOf('/') == -1) {
					game.makeTracklist(Number(modifiedUrl), 'my-playlist');
				} else {
					game.makeTracklist(modifiedUrl.slice(0, modifiedUrl.indexOf('/')), 'my-playslit');
				}
			}
		})
		// возврат в меню
		document.querySelector('.leaver').addEventListener('click', function() {
			show('program-panel');
			showSlide('mode');
			game.count(true);
			game.song.pause();
			hide('total');
			hide('counter');
			hide('endthisgame');
			document.querySelector('.game-menu__mode').innerHTML = 'Выберите режим';
			document.querySelector('.game-menu__playlist').innerHTML = '';
			game.endTimer();
			loading(false);
		})

		// конец игры
		document.querySelector('.endthisgame').addEventListener('click', function() {
			game.endGame();
			game.count(true);
			game.song.pause();
			game.endTimer();
		})

		// ответы
		document.querySelectorAll('.round__answer .answer__inner').forEach(item => {
			item.addEventListener('click', function() {
				game.checkAnswer(+this.parentNode.dataset.index);
				show('endround__next');
				hide('endround__empty');
			})
		});

		// переход в следующий раунд
		document.querySelector('.endround__next').addEventListener('click', function() {
			document.querySelector('.bottom-bar__progress-line').classList.remove('notransition');
			hide('endround__next');
			show('endround__empty');
			game.preRound();
		})

		// like 
		document.querySelector('.endround__like').addEventListener('click', function() {
			// закрытие всей анимации с message
			document.querySelector('.endround__message').style.animation = 'bot 0.1s';
			//
			if (this.classList.contains('endround__like_deleted')) {
				this.classList.remove('endround__like_deleted');
				this.classList.add('endround__like_joined');
				this.querySelector('.fa').classList.add('fa-heart');
				this.querySelector('.fa').classList.remove('fa-heart-o');
				document.querySelector('.endround__message').innerHTML = 'Трек добавлен в плейлист "Мне нравится"';
			} else {
				this.classList.add('endround__like_deleted');
				this.classList.remove('endround__like_joined');
				this.querySelector('.fa').classList.remove('fa-heart');
				this.querySelector('.fa').classList.add('fa-heart-o');
				document.querySelector('.endround__message').innerHTML = 'Трек удален из плейлиста "Мне нравится"';
			}
			// появление анимации
			setTimeout(function() {
				document.querySelector('.endround__message').style.animation = 'message 4s';
			}, 100)
		})

		// easy mode
		document.querySelector('.program-panel__easy-mode').addEventListener('click', function() {
			if (this.classList.contains('program-panel__easy-mode_active')) {
				this.classList.remove('program-panel__easy-mode_active');
				game.easyMode = false;
			} else {
				this.classList.add('program-panel__easy-mode_active');
				game.easyMode = true;
			}
		})
		// mode
		document.querySelector('.program-panel__mode').addEventListener('click', function() {
			if (this.classList.contains('program-panel__mode_artist')) {
				this.classList.remove('program-panel__mode_artist');
				game.mode = 'song';
				this.innerHTML = 'Песни';
			} else {
				this.classList.add('program-panel__mode_artist');
				game.mode = 'artist';
				this.innerHTML = 'Артисты';
			}
		})

		// song onload
		this.song.addEventListener("loadeddata", function() {
 			if (this.duration >= 15) {
 				game.correct = game.tracklist[game.position];
				game.round();
 			} else {
 				// если < 15, идем далее
 				console.log('low duration on ' + game.position);
				game.passCounter++;
 				game.position++;
 				game.preRound();
 				return;
 			}
		});
		// song onplaying
		this.song.onplaying = function() {
 			console.log('play');
			document.querySelector('.bottom-bar__progress-line').classList.remove('notransition');
			document.querySelector('.bottom-bar__progress-line').style.width = '100%';
			// гифка
			document.querySelectorAll('.round__gif-wrapper').forEach(function(item) {
				item.style.display = 'none';
			})
			let gifNum = randomInteger(1, 14);
			document.querySelectorAll('.round__gif-wrapper')[+gifNum - 1].style.display = 'flex';
			show('round__gif-block');
			game.total();
			showSlide('round');
		};
		//song onpause
		this.song.onpause = function() {
 			console.log('play');
			document.querySelector('.bottom-bar__progress-line').classList.add('notransition');
			document.querySelector('.bottom-bar__progress-line').style.width = '0%';
			hide('round__gif-block');
		};
	},
	// отрисовать обложки из БД
	printLabels() {
		document.querySelector('.genre').querySelector('.carousel__slides').innerHTML = '';
		this.base.genre.forEach(item => {
			let img = `https://api.deezer.com/playlist/${item.id}/image`;
			let template = `<div class="carousel__slide genre__item" data-id='${item.id}' data-type='genre'><div class="genre__button label-button"><img class="label-button__img" src="${img}" alt=""><div class="label-button__name">${item.name}</div></div></div>`
			document.querySelector('.genre').querySelector('.carousel__slides').insertAdjacentHTML('beforeend', template);
			document.querySelector('.genre').querySelector('.carousel__slides').lastChild.addEventListener('click', function() {
				game.makeTracklist(this.dataset.id, 'genre');
			})	
		});
		document.querySelector('.playlist').querySelector('.carousel__slides').innerHTML = '';
		this.base.playlists.forEach(item => {
			let img = `https://api.deezer.com/playlist/${item.id}/image`;
			let template = `<div class="carousel__slide playlist__item" data-id='${item.id}' data-type='playlist'><div class="playlist__button label-button"><img class="label-button__img" src="${img}" alt=""><div class="label-button__name">${item.name}</div><div class="label-button__play"><div class="label-button__play-btn"><i class="fa fa-play" aria-hidden="true"></i></div></div></div></div>`
			document.querySelector('.playlist').querySelector('.carousel__slides').insertAdjacentHTML('beforeend', template);
			document.querySelector('.playlist').querySelector('.carousel__slides').lastChild.addEventListener('click', function() {
				game.makeTracklist(this.dataset.id, 'playlist');
			})	
		})
	},
	// составить плейлист
	async makeTracklist(id, type) {
		loading();
		let trackObj = await request('playlist', id);
		let tracks = shuffleNew(trackObj.tracks.data);
		console.log(tracks.length);
		this.tracklist = tracks.filter(item => item.readable == true);
		// если в плейлисте меньше 4 песни - не пропускаем его
		if (this.tracklist.length < 4) {
			loading(false);
			console.log('Длина плейлиста всего ' + this.tracklist.length + ', запуск невозможен');
			return;
		}
		// если угадываение по артистам, то ищем минимум 4 разных артиста в плейлисте, если меньше - не пропускаем
		if (this.mode == 'artist') {
			let testArtistArr  = [];
			this.tracklist.forEach(item => {
				if (testArtistArr.findIndex(art => art == item.artist.name) == -1) {
					testArtistArr.push(item.artist.name);
				}
			})
			if (testArtistArr.length < 4) {
				loading(false);
				console.log('Слишком мало разных артистов в плейлисте, должно быть минимум 4');
				return;
			}
		}
		console.log(this.tracklist.length);
		this.position = 0;
		this.type = type;
		console.log(this.tracklist);
		console.log(this.timer);
		this.count(true);
		this.trackCounter = 0;
		this.passCounter = 0;
		this.oneclick = true;
		show('endthisgame');
		show('counter');
		if (this.type == 'playlist') {
			show('total');
			document.querySelector('.game-menu__mode').innerHTML = 'Плейлист: ';
			let playlistId = +id;
			// console.log(bd.playlists.find(item => item.id == playlistId));
			document.querySelector('.game-menu__playlist').innerHTML = bd.playlists.find(item => item.id == playlistId).name;
		} else if (this.type == 'genre') {
			document.querySelector('.game-menu__mode').innerHTML = 'Жанр: ';
			let playlistId = +id;
			console.log(bd.genre.find(item => item.id == playlistId));
			document.querySelector('.game-menu__playlist').innerHTML = bd.genre.find(item => item.id == playlistId).name;
		} else if (this.type == 'my-playlist') {
			document.querySelector('.game-menu__mode').innerHTML = 'Свой плейлист';
			document.querySelector('.game-menu__playlist').innerHTML = '';
		}
		this.preRound();
	},
	// подготовка к раунду
	preRound() {
		this.oneclick = true;
		loading();
		if (this.position < this.tracklist.length) {
			let track = this.tracklist[this.position];
			this.song.setAttribute('src', track.preview);
		} else {
			if (this.type == 'playlist') {
				this.endGame();
			} else {
				this.position = 0;
				let track = this.tracklist[this.position];
				this.song.setAttribute('src', track.preview);
			}
		}
	},
	// раунд
	round() {
		// массив ответов
		let answers = [];
		answers.push(this.correct);
		// берем еще 3 рандомных трека в режиме song
		if (this.mode == 'song') {
			while (answers.length < 4) {
				let random = randomInteger(0, this.tracklist.length - 1);
				//console.log('random: ' + random);
				if (!(answers.find(item => item.id == this.tracklist[random].id))) {
					answers.push(this.tracklist[random]);
				}
			}
		// в режиме artist
		} else if (this.mode == 'artist') {
			while (answers.length < 4) {
				let random = randomInteger(0, this.tracklist.length - 1);
				//console.log('random: ' + random);
				if (!(answers.find(item => item.artist.name == this.tracklist[random].artist.name))) {
					answers.push(this.tracklist[random]);
				}
			}
		}
		shuffle(answers);
		console.log(answers);
		// ищем индекс правильного ответа
		this.indexOfTrue = answers.findIndex(item => item.id == this.correct.id);
		console.log('Правильный index: ' + this.indexOfTrue);
		// вставляем варианты ответа в режиме song
		if (this.mode == 'song') {
			answers.forEach((item, index) => {
				document.querySelector(`[data-index="${index}"] .answer__track`).innerHTML = item.title;
				document.querySelector(`[data-index="${index}"] .answer__artist`).innerHTML = item.artist.name;
				document.querySelector(`[data-index="${index}"] .answer__img`).setAttribute('src', item.album.cover);
			})
		} else if (this.mode == 'artist') {
			answers.forEach((item, index) => {
				document.querySelector(`[data-index="${index}"] .answer__track`).innerHTML = item.artist.name;
				document.querySelector(`[data-index="${index}"] .answer__artist`).innerHTML = '';
				document.querySelector(`[data-index="${index}"] .answer__img`).setAttribute('src', `https://api.deezer.com/artist/${item.artist.id}/image`);
			})
		}
		this.isTimer = true;
		this.timer = setTimeout(() => {
			this.song.pause();
			this.isTimer = false;
			
		}, 15000);
		loading(false);
		document.querySelectorAll('.round__answer .answer__inner').forEach(item => item.style.display = 'flex');
		game.song.play();
	},
	// проверка на правильность ответа
	checkAnswer(index) {
		document.querySelector('.endround__answer .answer__img').setAttribute('src', this.correct.album.cover);
		document.querySelector('.endround__answer .answer__track').innerHTML = this.correct.title;
		document.querySelector('.endround__answer .answer__artist').innerHTML = this.correct.artist.name;
		if (index == this.indexOfTrue) {
			document.querySelector('.endround__result').classList.remove('endround__result_lose');
			document.querySelector('.endround__result').classList.add('endround__result_win');
			document.querySelector('.endround__result').innerHTML = 'Верно!';
			this.endTimer();
			this.position++;
			this.song.pause();
			this.trackCounter++;
			if (this.oneclick) {
				this.count();
			}
			document.querySelector('.endround__message').style.animation = 'bot 0.1s';
			document.querySelector('.endround__like').classList.add('endround__like_deleted');
			document.querySelector('.endround__like').classList.remove('endround__like_joined');
			document.querySelector('.endround__like').querySelector('.fa').classList.remove('fa-heart');
			document.querySelector('.endround__like').querySelector('.fa').classList.add('fa-heart-o');
			showSlide('endround');
			document.querySelectorAll('.round__answer .answer__img').forEach(item => {
				item.setAttribute('src', 'img/download.png');
			})
		} else {
			if (this.easyMode) {
				document.querySelector(`.answer[data-index="${index}"]`).querySelector('.answer__inner').style.display = 'none';
				this.oneclick = false;
			} else {
				console.log('else');
				document.querySelector('.endround__result').classList.remove('endround__result_win');
				document.querySelector('.endround__result').classList.add('endround__result_lose');
				document.querySelector('.endround__result').innerHTML = 'Неверно!';
				this.endTimer();
				this.position++;
				this.trackCounter++;
				this.song.pause();
				document.querySelector('.endround__message').style.animation = 'bot 0.1s';
			document.querySelector('.endround__like').classList.add('endround__like_deleted');
			document.querySelector('.endround__like').classList.remove('endround__like_joined');
			document.querySelector('.endround__like').querySelector('.fa').classList.remove('fa-heart');
			document.querySelector('.endround__like').querySelector('.fa').classList.add('fa-heart-o');
				showSlide('endround');
				document.querySelectorAll('.round__answer .answer__img').forEach(item => {
					item.setAttribute('src', 'img/download.png');
				})
			}
		}
	},
	// отрисовать количество правильных ответов
	count(isNew = false) {
		if (isNew) {
			this.counter = 0;
			document.querySelector('.counter').innerHTML = this.counter;
		} else {
			this.counter++;
			document.querySelector('.counter').innerHTML = this.counter;
		}
	},
	// отрисовать total в менюшке
	total() {
		document.querySelector('.total__position').innerHTML = this.position + 1;
		document.querySelector('.total__all').innerHTML = this.tracklist.length;
	},
	// обнулить таймер
	endTimer() {
		if (this.isTimer) {
			window.clearTimeout(this.timer);
			this.isTimer = false;
			this.song.pause();
		}
	},
	// конец игры, отрисовка статистики
	endGame() {
		document.querySelector('.endgame__all').innerHTML = this.trackCounter;
		document.querySelector('.endgame__win').innerHTML = this.counter;
		document.querySelector('.endgame__lose').innerHTML = this.trackCounter - (this.counter + this.passCounter);
		document.querySelector('.endgame__pass').innerHTML = this.passCounter;
		hide('total');
		hide('counter');
		hide('endthisgame');
		showSlide('endgame');
	}
}