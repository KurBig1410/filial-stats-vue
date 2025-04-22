<template>
    <div class="wrapper">
        <div class="card">
            <h1 class="title">Статистика филиалов</h1>
            <div v-if="loading" class="status">Загрузка данных...</div>
            <table v-else class="table">
                <thead>
                    <tr>
                        <th v-for="header in headers" :key="header">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                        <td v-for="header in headers" :key="header">{{ row[header] }}</td>
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
            headers: [],
            tableData: [],
            loading: true,
        };
    },
    mounted() {
        fetch("/filial_stats.csv")
            .then((res) => res.text())
            .then((text) => {
                const rows = text.split("\n").filter(row => row.trim() !== "");
                const headers = rows[0].split(",");
                const data = rows.slice(1).map(row => {
                    const values = row.split(",");
                    return headers.reduce((obj, key, i) => {
                        obj[key] = values[i];
                        return obj;
                    }, {});
                });
                this.headers = headers;
                this.tableData = data;
                this.loading = false;
            });
    },
};
</script>

<style scoped>
.wrapper {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  background-color: #f9f9f9;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 2rem;
  overflow-x: auto;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #000000;
}

.status {
  text-align: center;
  font-size: 1rem;
  color: #000000;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
}
.table, th, td {
  color: #222; /* ← тёмно-серый, хорошо читается на светлом фоне */
}
th, td {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f0f0f0;
  font-weight: 600;
  color: #000000;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #eef2ff;
}
</style>