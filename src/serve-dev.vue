
<template>
  <div id="app">
    <div class="dates-result">
      <div class="start-date" :class="{ 'active': active === 'startDate' }" @click="select('startDate')">{{ startDate || 'Start date' }}</div>
      <svg width="8" height="12" viewbox="0 0 12 12"><path d="M2 0L0.589996 1.41L5.17 6L0.589996 10.59L2 12L8 6L2 0Z" fill="#1D2129"/></svg>
      <div class="end-date" :class="{ 'active': active === 'endDate' }" @click="select('endDate')">{{ endDate || 'End date' }}</div>
    </div>

    <date-range-select
      class="date-range"
      :start-on-sunday="false"
      :month-count="2"
      v-model="dates"
      v-if="show"
      ref="dateRangeSelect"
      @change-focus="active = $event"
    >
      <template #footer>
        <div class="bottom">
          <a @click="dates.startDate = null; dates.endDate = null;">Clear</a>
          <a @click="show = !show">Confirm</a>
        </div>
      </template>
    </date-range-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DateRangeSelect from './vue-date-range-select.vue';

@Component({ components: { DateRangeSelect }})
export default class componentName extends Vue {
  active: null | 'startDate' | 'endDate' = null;
  show: boolean = true;
  dates: { startDate: Date | null, endDate: Date | null } = {
    startDate: null,
    endDate: null,
  }
  $refs! :{
    dateRangeSelect: DateRangeSelect;
  }

  get startDate() {
    const { startDate } = this.dates;
    return startDate && `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
  }

  get endDate() {
    const { endDate } = this.dates;
    return endDate && `${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`;
  }

  select(date: string) {
    if (this.show) {
      return this.$refs.dateRangeSelect.setIsSelectingStartDate(date === 'startDate');
    } else {
      this.show = true;
    }
  }

  resetDateRange() {
    this.show = false;
    window.setTimeout(() => { this.show = true }, 100)
  }
}
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Poppins:500&display=swap');
  @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');

  * {
    letter-spacing: .1em;
    margin: 0;
    padding: 0;
  }

  #app {
    font-family: Arial, Helvetica, sans-serif;
    font-family: 'Poppins', sans-serif;
    background-color: #fafafa;
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  </style>


  <style scoped>
  a {
    color: hsl(180, 25%, 50%);
    display: block;
    letter-spacing: initial;
    float: left;
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
  }

  a:last-child {
    text-align: right;
    float: right;
  }

  .dates-result {
    display: flex;
    align-items: center;
    width: fit-content;
    background-color: #ffffff;
    padding: 12px 24px;
    border-radius: 4px;
    margin-bottom: 16px;
    border: 1px solid rgba(0, 0, 0, .08);
  }

  svg {
    padding: 0 24px;
  }

  .dates-result > div {
    min-width: 60px;
    cursor: pointer;
  }

  .active {
    border-bottom: 2px solid hsl(180, 45%, 35%);
  }

  .date-range {
    --dr-color-primary: hsl(180, 25%, 40%);
    --dr-color-primary-dark: hsl(180, 25%, 30%);
    --dr-color-primary-light: hsl(180, 25%, 50%);
    width: 700px;
    background-color: #ffffff;
    position: relative;
    border: 1px solid rgba(0, 0, 0, .08);
    border-radius: 6px;
    font-size: 12px;
    text-align: center;
  }

  .bottom {
    border-top: 1px solid rgba(0,0,0,.1);
    display: flex;
    width: 100%;
    height: 60px;
    padding: 12px;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }

</style>

<style module="airBnbStyle">

  .airbnb .date-range {
    width: 647px;
  }

  .airbnb a {
    color: black;
    text-decoration: underline;
    text-transform: none;
  }

  .airbnb a:last-child {
    color: white;
    font-weight: 400;
    background-color: black;
    text-decoration: none;
    border-radius: 8px;
  }

  .style-toggle {
    margin-top: 40px;
  }

  input {
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }

  label {
    cursor: pointer;
  }


  /* .wrapper {
    padding: 16px 24px;
  }

  .month {
    column-gap: 0;
    row-gap: 2px;
    margin-right: 32px;
    grid-template-rows: 56px 32px repeat(6, 1fr);
  }

  .monthTitle {
    font-weight: 400;
    font-size: 16px;
    padding-top: 8px;
    justify-content: center;
    align-items: flex-start;
  }

  .dayTitle {
    font-weight: 400;
    color: rgba(0,0,0,.2);
    justify-content: center;
    align-items: center;
  }

  .inPast {
    opacity: .2;
    pointer-events: none;
  }

  .day {
    height: 40px;
    width: 40px;
    letter-spacing: .01em;
    font-size: 14px;
    z-index: 2;
    color: rgb(34, 34, 34);
    position: relative;
  }

  .selected:not(.endDate):not(.startDate):not(.firstWeekDay):not(.lastWeekDay) {
    background-color: #F7F7F7;
    box-shadow: 10px 0 0 0 #F7F7F7, -10px 0 0 0 #F7F7F7;
  }

  .selected.lastWeekDay:not(.endDate):not(.startDate) {
    background-color: #F7F7F7;
    box-shadow: -10px 0 0 0 #F7F7F7;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .selected.firstWeekDay:not(.endDate):not(.startDate) {
    background-color: #F7F7F7;
    box-shadow: 10px 0 0 0 #F7F7F7;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .selected.firstWeekDay.lastWeekDay, .startDate.endDate, .day:hover {
    box-shadow: none;
  }

  .endDate, .startDate{
    color: #ffffff;
    background-color: rgb(34, 34, 34) !important;
    border-radius: 20px;
    z-index: 3;
  }

  .day:last-child:not(.endDate):not(.startDate).selected::after {
    content: '';
    height: 100%;
    width: 25px;
    background: linear-gradient(to right, #F7F7F7, white);
    position: absolute;
    top: 0;
    z-index: 1;
    right: -25px;
  }

  .day:first-of-type:not(.endDate):not(.startDate).selected::after {
    content: '';
    height: 100%;
    width: 25px;
    position: absolute;
    background: linear-gradient(to left, #F7F7F7, white);
    top: 0;
    z-index: 1;
    left: -25px;
  }

  .day:hover {
    width: 100%;
    height: 100%;
    border-radius: 20px !important;
    z-index: 3;
    border: 2px solid rgb(34, 34, 34);
    box-shadow: none !important;
  } */

  /* not used with airbnb styling, so this will reset those styling */
  /* .new {}
  .today {} */
</style>
