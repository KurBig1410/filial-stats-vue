<template>
  <div class="wrapper">
    <div class="header">
      <h1>Рельсы-рельсы, Шпалы-Шпалы</h1>

      <div class="date-title-wrapper">
        <h1 class="title" @click="toggleCalendar">
          Статистика филиалов с {{ dateRange.start }} по {{ dateRange.end }}
        </h1>

        <div v-if="showCalendar" class="calendar-popup">
          <label>С: <input type="date" v-model="customStart" /></label>
          <label>По: <input type="date" v-model="customEnd" /></label>
          <button @click="applyDateRange">Применить</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="status">Загрузка данных...</div>

    <div v-else class="table-scroll">
      <table class="rank-table">
        <thead>
          <tr>
            <th>Место</th>
            <th>Город/студия</th>
            <th>Владелец</th> <!-- Новый столбец -->
            <th class="sortable-header" @click="toggleSortDropdown">
              {{ getSortLabel(selectedSortKey) }}
              <div v-if="showSortDropdown" class="sort-dropdown">
                <div v-for="option in sortOptions" :key="option.key" @click.stop="selectSortOption(option.key)"
                  :class="{ active: selectedSortKey === option.key }">
                  {{ option.label }}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in filteredTableDataWithoutTotalAndZero" :key="index"
            :class="{ active: index === 6 }">
            <td>{{ index + 1 }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.owner || "—" }}</td>

            <td>{{ formatValue(row[selectedSortKey]) }}</td>

          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div class="filters">
        <button v-for="filter in filters" :key="filter.value" :class="{ active: selectedFilter === filter.value }"
          @click="selectedFilter = filter.value">
          {{ filter.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilialStatsViewer",
  data() {
    return {
      loading: true,
      selectedFilter: "all",
      showCalendar: false,
      customStart: null,
      customEnd: null,
      tableData: [],
      showSortDropdown: false,
      selectedSortKey: "income",
      sortOptions: [
        { key: "income", label: "Доход, ₽" },
        // { key: "owner", label: "Владелец" },
        { key: "avg_check_total", label: "Общий средний чек, ₽" },
        { key: "service_sum", label: "Сумма по услугам, ₽" },
        { key: "goods_sum", label: "Сумма по товарам, ₽" },
      ],
      filters: [
        { label: "Все", value: "all" },
        { label: "Города 700k+", value: "700k+" },
        { label: "300–700k", value: "300-700k" },
        { label: "До 300k", value: "-300k" },
        { label: "Студии > 6 мес", value: "old" },
        { label: "Студии < 6 мес", value: "new" },
      ],
    };
  },
  computed: {
    dateRange() {
      const format = (d) =>
        d.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

      const start = this.customStart
        ? new Date(this.customStart)
        : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      const end = this.customEnd ? new Date(this.customEnd) : new Date();

      return {
        start: format(start),
        end: format(end),
      };
    },
    filteredTableData() {
      const data = (() => {
        switch (this.selectedFilter) {
          case "700k+":
            return this.tableData.filter((f) => f.population_category === "700k+");
          case "300-700k":
            return this.tableData.filter((f) => f.population_category === "300–700k");
          case "-300k":
            return this.tableData.filter((f) => f.population_category === "до 300k");
          case "old":
            return this.tableData.filter((f) => f.is_younger_than_6_months === false);
          case "new":
            return this.tableData.filter((f) => f.is_younger_than_6_months === true);
          default:
            return this.tableData;
        }
      })();

      return [...data].sort((a, b) => (b[this.selectedSortKey] || 0) - (a[this.selectedSortKey] || 0));
    },
    filteredTableDataWithoutTotalAndZero() {
      return this.filteredTableData.filter(
        (row) => row.name !== "Итого" && (row[this.selectedSortKey] ?? 0) > 0
      );
    },
  },
  mounted() {
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.expand();
    }

    fetch("https://api.relsy-relsy.com/api/data")
      .then((res) => res.json())
      .then((data) => {
        this.tableData = data;
        this.loading = false;
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных:", error);
        this.loading = false;
      });
  },
  methods: {
    toggleCalendar() {
      this.showCalendar = !this.showCalendar;
    },
    applyDateRange() {
      this.showCalendar = false;
    },
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown;
    },
    selectSortOption(key) {
      this.selectedSortKey = key;
      this.showSortDropdown = false;
    },
    getSortLabel(key) {
      const found = this.sortOptions.find((opt) => opt.key === key);
      return found ? found.label : "Доход, ₽";
    },
    formatValue(value) {
      if (typeof value === "number") {
        return value.toLocaleString("ru-RU");
      }
      if (!isNaN(value) && value !== null && value !== "") {
        const num = parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString("ru-RU");
      }
      return value ?? "—";
    },
  },
};
</script>

<style scoped>
.sortable-header {
  position: relative;
  cursor: pointer;
}

.sort-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 10;
  min-width: 200px;
}

.sort-dropdown div {
  padding: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
}

.sort-dropdown div:hover,
.sort-dropdown div.active {
  background-color: #1976d2;
  color: white;
  border-radius: 4px;
}

/* Остальной CSS остаётся прежним */

#app {
  padding: 0rem;
  margin: 0 auto;
  /* padding: 2rem; */
  text-align: center;
}

/* Основной сброс и фон */
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background: #f2f2f2;
  overflow: hidden;
  box-sizing: border-box;
}

/* Корневой контейнер */
.wrapper {
  width: 100vw;
  height: 100vh;
  padding: 0;
  /* убираем отступы, можно добавить внутренние отступы через внутренние блоки */
  font-family: system-ui, sans-serif;
  /* background-color: #f2f2f2; */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-image: url('src/assets/public/background.svg');
  /* или '@/assets/background.svg' при импорте */
  background-size: cover;
  /* или contain, если нужно */
  background-repeat: no-repeat;
  background-position: center;
}

/* Заголовок */
.header {
  text-align: center;
  /* padding: 1rem; */
}

.header h1 {
  font-size: 1.2rem;
  background: #4b5e5a;
  padding: 0.8rem 1.2rem;
  border-radius: 20px;
  display: inline-block;
  /* box-shadow: inset 2px 2px 6px #bebebe, inset -2px -2px 6px #ffffff; */
  /* color: #fff; */
  /* margin: 0.5rem 0; */
}

/* Прокручиваемая таблица */
.table-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 90px;
  /* отступы внутри, а не у wrapper */
  box-sizing: border-box;
}

/* Таблица */
.rank-table {
  width: 100%;
  border-spacing: 0 10px;
  min-width: 600px;
  border-spacing: 8px 10px;
}

.rank-table th,
.rank-table td {
  background: #4b5e5a;
  padding: 1rem;
  text-align: center;
  border-radius: 12px;
  color: #fff;
  /* margin-left: 1rem; */
  /* margin-right: 1rem; */
  margin: 0 10px;
  /* <— добавим горизонтальный отступ */
  /* box-shadow: 2px 2px 5px #bebebe, -2px -2px 5px #ffffff; */
}

/* Футер */
.footer {
  /* padding: 0.6rem 1rem; */
  margin-bottom: 3rem;
  margin-top: 1rem;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  /* background: #ffffff; */
}

/* Фильтры */
.filters {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0.6rem;
  justify-content: center;
  scrollbar-width: none;
}

.filters::-webkit-scrollbar {
  display: none;
}

.filters button {
  padding: 0.6rem 1.2rem;
  background: #87938f;
  /* border: none; */
  border-radius: 12px;
  /* box-shadow: 2px 2px 5px #bebebe, -2px -2px 5px #ffffff; */
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.filters button.active {
  background: #bacac5;
  /* color: white; */
  /* box-shadow: inset 2px 2px 5px #125a9c, inset -2px -2px 5px #2196f3; */
}

.date-title-wrapper {
  position: relative;
  display: inline-block;
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.calendar-popup input {
  margin: 0.3rem 0;
  display: block;
}

.calendar-popup button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #1976d2;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

/* ——— Адаптация под мобильные ——— */
@media (max-width: 768px) {
  .header h1 {
    font-size: 1rem;
    padding: 0.6rem 1rem;
  }

  .rank-table th,
  .rank-table td {
    padding: 0.6rem;
    font-size: 0.8rem;
  }

  .filters button {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  .table-scroll {
    padding-bottom: 120px;
  }

  .rank-table {
    min-width: 100%;
  }
}
</style>