<template>
    <div class="calendar">
      <div
        v-for="(month, index) in months"
        :key="index"
        class="month"
      >
        <div class="month-name">{{ month.name }}</div>
        <div class="days-grid">
          <div
            v-for="day in month.days"
            :key="day.date.toDateString()"
            class="day"
            :class="{
              start: isStart(day.date),
              end: isEnd(day.date),
              inRange: isInRange(day.date),
              selected: isSelected(day.date),
            }"
            @click="selectDate(day.date)"
          >
            {{ day.date.getDate() }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  
  interface Day {
    date: Date
  }
  
  interface Month {
    name: string
    days: Day[]
  }
  
  const startDate = ref<Date | null>(null)
  const endDate = ref<Date | null>(null)
  
  const months = ref<Month[]>(generatePreviousMonths(4))
  
  function generatePreviousMonths(count: number): Month[] {
    const now = new Date()
    const months: Month[] = []
  
    for (let i = count; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const days: Day[] = []
      const year = date.getFullYear()
      const month = date.getMonth()
  
      while (date.getMonth() === month) {
        days.push({ date: new Date(date) })
        date.setDate(date.getDate() + 1)
      }
  
      const name = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(
        new Date(year, month)
      )
  
      months.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        days,
      })
    }
  
    return months
  }
  
  function selectDate(date: Date) {
    if (!startDate.value || (startDate.value && endDate.value)) {
      startDate.value = date
      endDate.value = null
    } else if (date < startDate.value) {
      endDate.value = startDate.value
      startDate.value = date
      logRange()
    } else {
      endDate.value = date
      logRange()
    }
  }
  
  function logRange() {
    if (startDate.value && endDate.value) {
      const [from, to] = [startDate.value, endDate.value].sort((a, b) => a.getTime() - b.getTime())
      const format = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
      console.log(format(from))
      console.log(format(to))
    }
  }
  
  function isSameDate(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }
  
  function isStart(date: Date) {
    return startDate.value && isSameDate(startDate.value, date)
  }
  
  function isEnd(date: Date) {
    return endDate.value && isSameDate(endDate.value, date)
  }
  
  function isSelected(date: Date) {
    return isStart(date) || isEnd(date)
  }
  
  function isInRange(date: Date) {
    return (
      startDate.value &&
      endDate.value &&
      date > startDate.value &&
      date < endDate.value
    )
  }
  </script>
  
  <style scoped>
  .calendar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    background-color: #1e1e1e;
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  .month {
    color: #fff;
  }
  
  .month-name {
    text-align: center;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
  }
  
  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 32px);
    gap: 6px;
    justify-content: center;
  }
  
  .day {
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    background-color: #e0e0e0;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
    color: #000;
    transition: all 0.2s;
  }
  
  .day.inRange {
    background-color: #c59c9c;
    border-radius: 0;
    color: #fff;
  }
  
  .day.start,
  .day.end {
    background-color: #3b2a2a;
    color: white;
    border-radius: 50% !important;
  }
  
  .day.selected {
    font-weight: bold;
  }
  </style>