const cards = [
  {
    subject: "Уведомление о доступе",
    fields: [
      ["От", "Служба поддержки <support@external.invalid>"],
      ["Кому", "Сотрудник <employee@office.example>"],
    ],
    body: "Здравствуйте!\n\nПожалуйста, сообщите одноразовый код из уведомления о входе.\n\nСлужба поддержки",
    options: [
      ["Внешний адрес отправителя", true, "Проверьте отправителя через внутренний справочник или известный контакт."],
      ["Просьба сообщить одноразовый код", true, "Одноразовый код подтверждает действие от вашего имени. Его нельзя передавать другому человеку."],
      ["Приветствие в начале письма", false, "Обычное приветствие само по себе не требует проверки."],
    ],
    advice: "Свяжитесь с поддержкой через привычный канал и сообщите о подозрительном письме.",
  },
  {
    subject: "Обновление реквизитов",
    fields: [
      ["От", "Бухгалтерия поставщика <billing@other.invalid>"],
      ["Кому", "Бухгалтерия <finance@office.example>"],
      ["Контакт в договоре", "billing@supplier.example"],
    ],
    body: "Добрый день!\n\nПишем по поводу ближайшей оплаты. Просим заменить банковские реквизиты в счёте. Подтверждение через контакт из договора не требуется.\n\nБухгалтерия поставщика",
    options: [
      ["Адрес отличается от указанного в договоре", true, "Отображаемое имя можно указать произвольно. Сверяйте полный адрес."],
      ["Новые платёжные реквизиты без подтверждения", true, "Изменение реквизитов требует отдельного подтверждения."],
      ["В теме письма нет ошибок", false, "Грамотное оформление само по себе ничего не говорит о подлинности."],
    ],
    advice: "Проверьте изменение по номеру из договора до оплаты.",
  },
  {
    subject: "Напоминание о встрече",
    fields: [
      ["От", "Ольга, координатор <olga@office.example>"],
      ["Кому", "Команда <team@office.example>"],
      ["Адрес в справочнике", "olga@office.example"],
    ],
    body: "Коллеги, добрый день!\n\nНапоминаю, что завтра в 11:00 у нас командная встреча. Время и переговорная уже указаны в рабочем календаре.\n\nДо встречи!\nОльга",
    options: [
      ["Знакомый адрес отправителя", false, "Совпадение адреса со справочником само по себе не является тревожным признаком."],
      ["Встреча уже есть в календаре", false, "Независимая запись в календаре подтверждает контекст."],
      ["Явных признаков в карточке нет", true, "По показанным деталям явных признаков нет. Это оценка конкретной карточки."],
    ],
    advice: "Если контекст изменится, сверьте сведения в календаре или у организатора.",
  },
];

const byId = (id) => document.getElementById(id);
let cardIndex = 0;
let correct = 0;
let graded = false;

function showCard() {
  const card = cards[cardIndex];
  graded = false;
  byId("step").textContent = `Карточка ${cardIndex + 1} из ${cards.length}`;
  byId("progress").value = cardIndex + 1;
  byId("subject").textContent = card.subject;
  byId("mail-body").textContent = card.body;
  byId("message").replaceChildren(...card.fields.flatMap(([name, value]) => {
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = name;
    detail.textContent = value;
    return [term, detail];
  }));
  byId("options").replaceChildren(...card.options.map(([name], index) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = index;
    label.append(input, name);
    return label;
  }));
  byId("error").hidden = true;
  byId("feedback").hidden = true;
  byId("fieldset").disabled = false;
  byId("check").hidden = false;
}

byId("answers").addEventListener("submit", (event) => {
  event.preventDefault();
  if (graded) return;
  const inputs = [...byId("options").querySelectorAll("input")];
  if (!inputs.some((input) => input.checked)) {
    byId("error").textContent = "Выберите хотя бы один вариант.";
    byId("error").hidden = false;
    inputs[0].focus();
    return;
  }

  const card = cards[cardIndex];
  let exact = true;
  card.options.forEach(([, expected], index) => {
    const input = inputs[index];
    const matches = input.checked === expected;
    const label = input.parentElement;
    if (!matches || input.checked) {
      const status = document.createElement("span");
      status.className = "option-status";
      status.textContent = matches ? "Верно" : input.checked ? "Лишний вариант" : "Пропущено";
      label.classList.add(matches ? "option-correct" : "option-error");
      label.append(status);
    }
    if (!matches) exact = false;
  });
  if (exact) correct += 1;
  graded = true;
  byId("error").hidden = true;
  byId("fieldset").disabled = true;
  byId("check").hidden = true;
  byId("feedback-title").textContent = exact ? "Всё верно" : "Разберём ответ";
  byId("explanations").replaceChildren(...card.options.map(([name, expected, explanation], index) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = name;
    const selected = inputs[index].checked;
    const result = selected === expected
      ? (selected ? "Выбрано верно." : "Верно оставлено без отметки.")
      : (selected ? "Лишняя отметка." : "Верный вариант пропущен.");
    if (selected !== expected) item.classList.add("answer-error");
    item.append(title, ` — ${result} ${explanation}`);
    return item;
  }));
  byId("advice").textContent = card.advice;
  byId("next").textContent = cardIndex + 1 === cards.length ? "Посмотреть результат" : "Следующая карточка";
  byId("feedback").hidden = false;
  byId("feedback-title").focus();
});

byId("options").addEventListener("change", () => {
  byId("error").hidden = true;
});

byId("next").addEventListener("click", () => {
  if (!graded) return;
  if (cardIndex + 1 < cards.length) {
    cardIndex += 1;
    showCard();
    byId("question").focus();
    return;
  }
  byId("score").textContent = `${correct} из ${cards.length}`;
  byId("exercise").hidden = true;
  byId("summary").hidden = false;
  byId("result").focus();
});

byId("restart").addEventListener("click", () => {
  cardIndex = 0;
  correct = 0;
  byId("summary").hidden = true;
  byId("exercise").hidden = false;
  showCard();
  byId("question").focus();
});

byId("settings-button").addEventListener("click", () => byId("settings").showModal());
showCard();
