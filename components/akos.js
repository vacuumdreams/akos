(function($, window){		
	Akos = function (separator, statuses, selectors) {

		this.defaults = {
			separator: '///',

			statuses: {
				enabled: {
					value: '1',
					class: ''
				},
				disabled: {
					value: '0',
					class: 'disabled'
				}
			},

			selectors: {
				container: '.questions-content',
				noitems: '.questinos-header-noitems',
				item: {
					content: '.questions-item',
					question: '.questions-item-question',
					answer: '.questions-item-answer'
				},
				addForm: {
					actionClass: 'saved',

					form: '.add',
					question: '.add-question-input',
					answer: '.add-answer-input',
					submit: '.add-btn'
				},
				editProcess: {
					actionClass: 'edit-enabled',

					form: '.edit',
					trigger: '.edit-item',
					question: '.edit-question',
					answer: '.edit-answer',
					submit: '.edit-submit',
					cancel: '.edit-cancel'
				},
				deleteProcess: {
					actionClass: 'questions-item-deleted',

					button: '.delete-item',
					modal: '.delete-confirm',
					confirm: '.delete-confirm-approve',
					cancel: '.delete-confirm-cancel'
				},
				statusProcess: {
					button: '.status-item'
				},
				modals: {
					showClass: 'modal-show',
					window: '.modal',
					trigger: '.modal-open',
					close: '.modal-close'
				},
				quiz: {
					disabledClass: 'quiz-disabled',
					startedClass: 'quiz-started',
					actionCorrectClass: 'correct',
					actionIncorrectClass: 'incorrect',

					trigger: '.quiz-start',
					stop: '.quiz-stop',
					item: '.quiz-item',
					question: '.quiz-question',
					answer: '.quiz-answer',
					submit: '.quiz-submit',
					scoresAll: '.quiz-score-all',
					scores: '.quiz-score-points',
					progress: '.quiz-progress'
				},
				template: {
					item: {
						name: 'item',
						callback: 'templateItem'
					},
					quizItem: {
						name: 'quizItem',
						callback: 'templateQuizItem'
					},
					quizEnd: {
						name: 'quizEnd',
						callback: 'templateQuizEnd'
					}
				}
			}				
		};

		this.start = function() {
			getItems();
			attachEvents();
		};

		var separator = (!separator) ? this.defaults.separator : separator,
			statuses = (!statuses) ? this.defaults.statuses : statuses,
			selectors = (!selectors) ? this.defaults.selectors : selectors,

			storage = {
				getItems: function (callback) {
					var items = [],
						current;
					$.each(localStorage, function(i, item) {
						current = {id: i, item: item};
						items.push(current);
						if (typeof callback === 'function') {
							callback(i, item);
						}
					});
					return items;
				},
				getItemsEnabled: function () {
					var items = [],
						current;
					$.each(localStorage, function(i, item) {
						if (item.charAt(0) === '1') {
							current = {id: i, item: item};
							items.push(current);
						}
					});
					return items;						
				},
				getNewId: function () {
					var items = [],
						current = 0,
						newId = 0;
					$.each(localStorage, function(i, item) {
						current = parseInt(i);
						newId = (newId >= current) ? newId : current;
					});
					return (newId + 1);				
				},
				getSize: function () {
					return localStorage.length;
				},
				get: function (key) {
					return localStorage.getItem(key);
				},
				set: function (key, value) {
					return localStorage.setItem(key, value);
				},
				remove: function (key) {
					return localStorage.removeItem(key);
				}
			},

			getItems = function () {
				var size = storage.getSize();

				if (size > 0) {
					storage.getItems(publishItem);
					enableQuiz();
				} else {
					$(selectors.noitems).fadeIn(350);
				}
			},

			getItem = function (id) {
				var item = storage.get(id);
				publishItem(id, item)
			},

			publishItem = function (id, item) {
				item = separate(item);
				addItemToPage(id, item);
			},

			separate = function (value) {
				value = value.split(separator);
				return {
					status: value[0],
					question: value[1],
					answer: value[2]
				}
			},

			addItemToPage = function (id, item, templateType) {
				$(selectors.container).append(template(id, item, templateType)).children().fadeIn(350);
			},

			template = function (id, item, type) {
				type = (type === undefined) ? selectors.template.item : type;
				if (type.callback === 'templateItem') {
					return templateItem(id, item);
				} else if (type.callback === 'templateQuizItem') {
					return templateQuizItem(id, item);
				} else if (type.callback === 'templateQuizEnd') {
					return templateQuizEnd(id, item);
				}
			},

			templateItem = function (id, item) {
				var statusClass = (item.status === statuses.disabled.value) ? 
									statuses.disabled.class : 
									statuses.enabled.class;

				return '<div class="questions-item ' + statusClass + '" data-id="' + id + '"><div class="item-wrap"><div class="question-item-top"><button class="questions-item-button delete-item"><i class="icon-delete"></i></button><button class="questions-item-button edit-item"><i class="icon-edit"></i></button><button class="questions-item-button status-item"><i class="icon-status"></i></button></div><div class="questions-item-content"><p class="questions-item-question">' + item.question + '</p></div><form class="questions-item-form edit"><input class="edit-question" value="' + item.question + '" placeholder="Question"><input class="edit-answer" value="' + item.answer + '" placeholder="Answer"><div class="button-wrap"><button class="edit-submit">Save</button><button class="edit-cancel">Cancel</button></div></form></div></div>';

			},

			templateQuizItem = function (id, item) {
				return '<div class="questions-item quiz-item" data-id="' + id + '"><div class="item-wrap"><div class="questions-item-content"><p class="quiz-question">' + item.question + '</p></div><form class="quiz-form"><input class="quiz-answer" placeholder="Answer"><div class="button-wrap"><button class="quiz-submit">Check</button><div class="quiz-feedbacks"><i class="quiz-message-icon quiz-correct icon-success"></i><i class="quiz-message-icon quiz-incorrect icon-fail"></i></div></div></form></div></div>';
			},

			templateQuizEnd = function (all, points) {
				var message;

				if (all === points) {
					message = 'Perfect run!';
				} else if (all === points + 1) {
					message = 'Almost made it. One mistake though.';
				} else {
					message = 'You answered correctly to ' + points + ' questions out of ' + all;
				}

				return '<div class="quiz-end"><p>' + message + '</p><button class="quiz-stop">OK</button></div>';
			}

			attachEvents = function () {

				$(selectors.quiz.trigger).on('click', launchQuiz);

				$(selectors.addForm.submit).on('click', saveItem);

				$(selectors.container).on('click', selectors.editProcess.trigger, editItem)
									  .on('click', selectors.deleteProcess.button, deleteItem)
									  .on('click', selectors.statusProcess.button, statusToggleItem);

				$(document).on('click', selectors.modals.trigger, modalOpen)
						   .on('click', selectors.modals.close, modalClose);

			},

			modalOpen = function (e) {
				if (e) { e.preventDefault(); }
				$($(this).data('trigger')).addClass(selectors.modals.showClass);
			},

			modalClose = function (e) {
				if (e) { e.preventDefault(); }
				$(this).closest(selectors.modals.window).removeClass(selectors.modals.showClass);
			},

			saveItem = function (e) {
				var $form = $(this).closest(selectors.addForm.form),
					$q = $form.children(selectors.addForm.question),
					$a = $form.children(selectors.addForm.answer),
					question = $q.val(),
					answer = $a.val(),
					id = storage.getNewId(),
					state = statuses.enabled.value;

				e.preventDefault();
				$form.removeClass(selectors.addForm.actionClass);

				storage.set(id, state + separator + question + separator + answer);
				addItemToPage(id, {status: state, question: question, answer: answer});
				$form.addClass(selectors.addForm.actionClass);

				$q.val('');
				$a.val('');

				if (storage.getSize() === 1) {
					enableQuiz();
					$(selectors.noitems).fadeOut(350);
				}

				setTimeout(function(){
					$form.removeClass(selectors.addForm.actionClass);
				}, 3000);
			},

			editItem = function (e) {
				var $item = $(this).closest(selectors.item.content),
					actionClass = selectors.editProcess.actionClass,
					id = $item.data('id'),
					attachEdit = function (e) {
						var $form = $(this).closest(selectors.editProcess.form),
							$q = $form.children(selectors.editProcess.question),
							$a = $form.children(selectors.editProcess.answer),
							oldValue = separate(storage.get(id)),
							question = ($q.val()) ? $q.val() : oldValue.question,
							answer = ($a.val()) ? $a.val() : oldValue.answer,
							status = oldValue.status;

						e.preventDefault();
						storage.set(id, status + separator + question + separator + answer);

						$item.find(selectors.item.question).html(question);
						$item.find(selectors.item.answer).html(answer);
						$q.val(question);
						$a.val(answer);

						cancelEdit();
					},
					cancelEdit = function (e) {
						if (e) { e.preventDefault(); }
						$item.removeClass(actionClass);
					};

				e.preventDefault();

				$item.addClass(actionClass)
					 .on('click', selectors.editProcess.submit, attachEdit)
					 .on('click', selectors.editProcess.cancel, cancelEdit);

			},

			destroyItem = function (id, $item) {
				storage.remove(id);
				$item.addClass(selectors.deleteProcess.actionClass).delay(350).queue(function(){
					$(this).detach().dequeue();
				});
			},

			deleteItem = function () {
				var $item = $(this).closest(selectors.item.content),
					$modal = $(selectors.deleteProcess.modal),
					id = $item.data('id'),
					destroy = function (e) {
						e.preventDefault();

						$modal.removeClass(selectors.modals.showClass);
						destroyItem(e.data.id, e.data.item);

						if (storage.getSize() === 0) {
							disableQuiz();
							$(selectors.noitems).fadeIn(350);
						}

					}

				$modal.addClass(selectors.modals.showClass)
					  .on('click', selectors.deleteProcess.confirm, {id: id, item: $item}, destroy);

			},

			statusToggleItem = function () {
				var $item = $(this).closest(selectors.item.content),
					id = $item.data('id');
					currentValue = storage.get(id),
					newStateValue = ($item.hasClass(statuses.disabled.class)) ? statuses.enabled.value : statuses.disabled.value;

				storage.set(id, newStateValue + currentValue.slice(1));
				$item.toggleClass(statuses.disabled.class);
			},

			enableQuiz = function () {
				$(selectors.quiz.trigger).removeClass(selectors.quiz.disabledClass);
			},

			disableQuiz = function () {
				$(selectors.quiz.trigger).addClass(selectors.quiz.disabledClass);
			},

			launchQuiz = function (e) {

				var $button = $(this),
					items = storage.getItemsEnabled(),
					all = items.length,
					counter = 0,
					points = 0,
					$scores = $(selectors.quiz.scores),
					removeDisabled = function () {

					},
					shuffle = function (array) {
						var currentIndex = array.length, temporaryValue, randomIndex ;
						while (0 !== currentIndex) {
							randomIndex = Math.floor(Math.random() * currentIndex);
							currentIndex -= 1;
							temporaryValue = array[currentIndex];
							array[currentIndex] = array[randomIndex];
							array[randomIndex] = temporaryValue;
						}
						return array;
					},
					checkAnswer = function (e) {
						var $item = $(this).closest(selectors.quiz.item),
							id = $item.data('id'),
							correctAnswer = separate(storage.get(id)).answer,
							$a = $item.find(selectors.quiz.answer),
							answer = $a.val();

						if (e) { e.preventDefault(); }

						if (correctAnswer === answer) {
							points++;
							counter++;
							updatePoints(points);
							updateProgress(counter * 100 / all);
							$item.addClass(selectors.quiz.actionCorrectClass);
							setTimeout(function(){
								$item.removeClass(selectors.quiz.actionCorrectClass);
								displayNext(counter);
								return;
							}, 500);
						} else {
							counter++;
							updateProgress(counter * 100 / all);
							$item.addClass(selectors.quiz.actionIncorrectClass);
							setTimeout(function(){
								$item.removeClass(selectors.quiz.actionIncorrectClass);
								displayNext(counter);
								return;
							}, 500);
						}
					},
					updatePoints = function (newPoints) {
						$(selectors.quiz.scores).html(newPoints);
					},
					updateProgress = function (number) {
						$(selectors.quiz.progress).css('width', number + '%')
					},
					displayNext = function (id) {
						var current;
						if (id < items.length) {
							var current = items[id];
							$(selectors.container).fadeOut().delay(350).queue(function(){
								$(this).html('').show().dequeue();
								addItemToPage(current.id, separate(current.item), selectors.template.quizItem);
								$(selectors.quiz.answer).focus();
							});
						} else {
							$(selectors.container).fadeOut().delay(350).queue(function(){
								$(this).html('').show().dequeue();
								addItemToPage(all, points, selectors.template.quizEnd);
							});
						}
					},
					stopQuiz = function (e) {
						if (e) { e.preventDefault(); }

						console.log(this);

						$('body').removeClass(selectors.quiz.startedClass);

						$(selectors.container).fadeOut().delay(350).queue(function(){
							$(this).html('').show().dequeue();
							getItems();
						});

					};

				e.preventDefault();

				if ($button.hasClass(selectors.quiz.disabledClass)) {
					return;
				}

				$(selectors.quiz.scoresAll).html(all);
				updatePoints(points);
				updateProgress(counter);

				$('body').addClass(selectors.quiz.startedClass)
						 .on('click', selectors.quiz.stop, stopQuiz);
				$(selectors.container).on('click', selectors.quiz.submit, checkAnswer);

				items = shuffle(items);
				displayNext(counter);
			}
		}
})(jQuery, window);