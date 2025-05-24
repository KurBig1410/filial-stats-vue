<template>
    <div class="wrapper">
      <div class="card">
        <h1 class="title">
          Статистика филиалов с {{ dateRange.start }} по {{ dateRange.end }}
        </h1>
  
        <div class="filters">
          <button :class="{ active: selectedFilter === 'all' }" @click="selectedFilter = 'all'">Все</button>
          <button :class="{ active: selectedFilter === '700k+' }" @click="selectedFilter = '700k+'">Города 700k+</button>
          <button :class="{ active: selectedFilter === '300-700k' }"
            @click="selectedFilter = '300-700k'">300–700k</button>
          <button :class="{ active: selectedFilter === '-300k' }" @click="selectedFilter = '-300k'">До 300k</button>
          <button :class="{ active: selectedFilter === 'old' }" @click="selectedFilter = 'old'">Студии > 6 мес</button>
          <button :class="{ active: selectedFilter === 'new' }" @click="selectedFilter = 'new'">Студии < 6 мес</button>
        </div>
  
        <div v-if="loading" class="status">Загрузка данных...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th v-for="col in headers" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in filteredTableDataWithoutTotal" :key="rowIndex">
              <td v-for="col in headers" :key="col.key">
                <span v-if="col.key === 'index'">{{ rowIndex + 1 }}</span>
                <span v-else>{{ formatValue(row[col.key]) }}</span>
              </td>
            </tr>
            <tr v-if="totalRow && selectedFilter === 'all'">
              <td v-for="col in headers" :key="col.key" style="font-weight: bold">
                {{ formatValue(totalRow[col.key]) }}
              </td>
            </tr>
          </tbody>
        </table>
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
        tableData: [],
        headers: [
          { key: "index", label: "Место" },
          // { key: "id", label: "id" },
          { key: "name", label: "Филиал" },
          { key: "income", label: "Доход, ₽" },
          { key: "service_sum", label: "Сумма по услугам, ₽" },
          { key: "goods_sum", label: "Сумма по товарам, ₽" },
          // { key: "avg_filling", label: "Средняя заполненность" },
          { key: "avg_check_service", label: "Средний чек по услугам, ₽" },
          // { key: "lost_clients", label: "Потерянных клиентов" },
          // { key: "repeat_clients", label: "Повторных клиентов" },
          // { key: "canceled_appointments", label: "Отменённых записей" },
          { key: "avg_check_total", label: "Общий средний чек, ₽" },
          // { key: "new_clients", label: "Новых клиентов" },
          // { key: "unfinished_appointments", label: "Незавершённых записей" },
          // { key: "finished_appointments", label: "Завершённых записей" },
          // { key: "total_appointments", label: "Всего записей" },
          { key: "owner", label: "Владелец" },
          { key: "population_category", label: "Категория города" },
        ],
      };
    },
    computed: {
      dateRange() {
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - 29);
  
        const format = (d) =>
          d.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
  
        return {
          start: format(past),
          end: format(now),
        };
      },
      filteredTableDataWithoutTotal() {
        return this.filteredTableData.filter(row => row.name !== "Итого");
      },
      totalRow() {
        return this.tableData.find(row => row.name === "Итого");
      },
      filteredTableData() {
        switch (this.selectedFilter) {
          case "700k+":
            return this.tableData.filter(f => f.population_category === "700k+");
          case "300-700k":
            return this.tableData.filter(f => f.population_category === "300–700k");
          case "-300k":
            return this.tableData.filter(f => f.population_category === "до 300k");
          case "old":
            return this.tableData.filter(f => f.is_younger_than_6_months === false);
          case "new":
            return this.tableData.filter(f => f.is_younger_than_6_months === true);
          default:
            return this.tableData;
        }
      }
    },
    mounted() {
      fetch("https://api.relsy-relsy.com/api/data")
        .then((res) => res.json())
        .then((data) => {
          this.tableData = data.sort((a, b) => (b.income || 0) - (a.income || 0));
          this.loading = false;
        })
        .catch((error) => {
          console.error("Ошибка загрузки данных:", error);
          this.loading = false;
        });
    },
    methods: {
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
  .wrapper {
    /* max-width: 1200px; */
    margin: 2rem auto;
    padding: 1rem;
    font-family: system-ui, sans-serif;
    background-color: #f9f9f9;
  }
  
  .card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    overflow-x: auto;
  }
  
  .title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #000;
  }
  
  .status {
    text-align: center;
    font-size: 1rem;
    color: #666;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    background-color: #fff;
  }
  
  .table,
  th,
  td {
    color: #222;
  }
  
  th,
  td {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  th {
    background-color: #f0f0f0;
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  tr:hover {
    background-color: #eef2ff;
  }
  </style>









// const tg = window.Telegram.WebApp;
// tg.ready(); // обязательно

// const user = tg.initDataUnsafe?.user;
// if (!user) {
//   this.hasAccess = false;
//   return;
// }

// fetch(`https://api.relsy-relsy.com/api/check_access?id=${user.id}`)
//   .then(res => res.json())
//   .then(data => {
//     if (data.allowed) {
//       this.loadData(); // твоя логика загрузки
//     } else {
//       this.hasAccess = false;
//     }
//   });