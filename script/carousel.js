const minMargin = 4; // минимальный margin-left и margin-right для элементов

const carousel = {
	carousels: [
		// {
		// 	container: '.genre__carousel',
		// 	slides: 1,
		// 	containerWidth: 100,
		// 	itemWidth: 
		// 	itemMargin: 
		//	slidesContWidth:
		//	colPerOneSlide:
        //  curMargin:
		// }
	],
	// добавить карусель
	// selector - селектор контейнера карусели
	// colSlides - количество слайдов на одном экране
	// colPerOne - сколько пролистывать слайдов за раз
	// resize - нужно ли менять размеры при ресайзе окна
	add(selector, colSlides, colPerOne = 1, resize = false) {
		let obj = {};
		obj.container = selector;
		obj.slides = colSlides;
		this.carousels.push(obj);
		[obj.containerWidth, obj.itemWidth, obj.itemMargin] = calcParameters(selector, colSlides);
		obj.startItemWidth = obj.itemWidth;
        obj.curMargin = 0;
		document.querySelector(selector).querySelectorAll('.carousel__slide').forEach(function(item) {
			item.style.width = this.carousels[this.carousels.length - 1].itemWidth + 'px';
			item.style.marginLeft = this.carousels[this.carousels.length - 1].itemMargin + 'px';
			item.style.marginRight = this.carousels[this.carousels.length - 1].itemMargin + 'px';
		}.bind(this));
		obj.slidesContWidth = document.querySelector(selector).querySelector('.carousel__slides').offsetWidth;
		obj.colPerOneSlide = colPerOne;
		document.querySelector(selector).querySelector('.carousel__left').addEventListener('click', this.toLeft);
		document.querySelector(selector).querySelector('.carousel__right').addEventListener('click', this.toRight);
		document.querySelector(selector).setAttribute('data-index', this.carousels.length - 1);
		if (resize) {
			window.addEventListener('resize', function() {
				this.refresh(selector);
			}.bind(this))
		}
	},
	// обновить информацию о карусели
	refresh(selector) {
		let carouselObj = this.carousels.find(item => item.container == selector);
        let multiplier = Math.round(Math.abs(carouselObj.curMargin) / (carouselObj.itemWidth + carouselObj.itemMargin + carouselObj.itemMargin));
        console.log(multiplier);
		console.log(carouselObj);
		[carouselObj.containerWidth, carouselObj.itemWidth, carouselObj.itemMargin] = calcParameters(selector, carouselObj.slides, carouselObj.startItemWidth);
		document.querySelector(selector).querySelectorAll('.carousel__slide').forEach(function(item) {
			item.style.width = this.carousels[this.carousels.length - 1].itemWidth + 'px';
			item.style.marginLeft = this.carousels[this.carousels.length - 1].itemMargin + 'px';
			item.style.marginRight = this.carousels[this.carousels.length - 1].itemMargin + 'px';
		}.bind(this));
        carouselObj.slidesContWidth = document.querySelector(selector).querySelector('.carousel__slides').offsetWidth;
        document.querySelector(selector).querySelector('.carousel__slides').style.marginLeft = (-(carouselObj.itemWidth + carouselObj.itemMargin + carouselObj.itemMargin) * multiplier) + 'px';
        carouselObj.curMargin = (-(carouselObj.itemWidth + carouselObj.itemMargin + carouselObj.itemMargin) * multiplier);
	},
	// слайд влево
	toLeft() {
		let index = this.closest('.carousel').dataset.index;
		let obj = carousel.carousels[index];
		let margin = obj.curMargin;
		let minMargin = 0;
		let oneSlide = (obj.itemWidth + obj.itemMargin * 2) * obj.colPerOneSlide;
		if ((Math.abs(margin) - oneSlide) <= minMargin) {
			this.closest('.carousel').querySelector('.carousel__slides').style.marginLeft = -minMargin + 'px';
            obj.curMargin = -minMargin;
		} else {
			this.closest('.carousel').querySelector('.carousel__slides').style.marginLeft = -(Math.abs(margin) - oneSlide) + 'px';
            obj.curMargin = -(Math.abs(margin) - oneSlide);
		}
	},
	// слайд вправо
	toRight() {
		let index = this.closest('.carousel').dataset.index;
		let obj = carousel.carousels[index];
		let margin = obj.curMargin;
		// ширина slides контейнера - ширина контейнера
		let maxMargin = obj.slidesContWidth - obj.containerWidth;
		let oneSlide = (obj.itemWidth + obj.itemMargin * 2) * obj.colPerOneSlide;
		if ((Math.abs(margin) + oneSlide) >= maxMargin) {
			this.closest('.carousel').querySelector('.carousel__slides').style.marginLeft = -maxMargin + 'px';
            obj.curMargin = -maxMargin;
		} else {
			this.closest('.carousel').querySelector('.carousel__slides').style.marginLeft = -(Math.abs(margin) + oneSlide) + 'px';
            obj.curMargin = -(Math.abs(margin) + oneSlide);
		}
	}
}


// расчитать itemWidth и itemMargin
function calcParameters(selector, slides, startWidth = false) {
	let inner = document.querySelector(selector).querySelector('.carousel__inner');
	let innerWidth = inner.offsetWidth;
	let itemWidth;
	if (startWidth == false) {
		itemWidth = inner.querySelector('.carousel__slide').offsetWidth;
	} else {
		itemWidth = startWidth;
	}
	let itemMax = Math.round((innerWidth / slides) * 10) / 10;
	//console.log(itemMax);
	if (itemMax > itemWidth + 2*minMargin) {
		itemMargin = (itemMax - itemWidth) / 2;
	} else {
		itemWidth = itemMax - 2*minMargin;
		itemMargin = minMargin;
	}
	return [innerWidth, itemWidth, itemMargin];
}