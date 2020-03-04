<template>
  <div class="date-range-select">
    <header v-if="hasSlot('header')">
      <slot name="header"/>
    </header>
    <section class="months">
      <button class="button-previous" @click="prevMonth">
        <slot name="button-previous"><svg width="8" height="12" viewbox="0 0 12 12"><path d="M7.41 1.41L6 0L0 6L6 12L7.41 10.59L2.83 6L7.41 1.41Z" fill="#1D2129"/></svg></slot>
      </button>
      <button class="button-next" @click="nextMonth">
        <slot name="button-next"><svg width="8" height="12" viewbox="0 0 12 12"><path d="M2 0L0.589996 1.41L5.17 6L0.589996 10.59L2 12L8 6L2 0Z" fill="#1D2129"/></svg></slot>
      </button>
      <transition-group :name="animationDirection" tag="div" class="month-row">
        <section class="month" :style="{ width: `${100 / monthCount}%` }" v-for="month in activeCalendarMonths" :key="month.header" @mouseleave="hover(null)">
          <h3 class="month-title">{{ month.header }}</h3>
          <h4 class="day-title" v-for="day in dayTitles" :key="day">{{day}}</h4>
          <div v-for="(day, index) in month.dates"
            @mouseenter="hover(day)"
            @click="select(day)"
            class="day"
            :class="{
                'today': day.isToday,
                'first-week-day': day.firstDayInWeek,
                'last-week-day': day.lastDayInWeek,
                'in-past': !day.isInFuture,
                'start-date': isStartDate(day),
                'end-date': isEndDate(day),
                'selected': isSelected(day),
                'new': isNew(day),
                'changing': isChanging(day),
              }"
            :style="[setStartingPosition(day, index), setPointerEvents(day)]"
            :key="index"
          >
            {{ day.date }}
          </div>
        </section>
      </transition-group>
    </section>
    <footer v-if="hasSlot('footer')">
      <slot name="footer"/>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

interface DateRangeCalendarMonth {
  header: string;
  year: number;
  month: number;
  dates: DateRangeDate[];
}

interface DateRangeDate {
  day: number;
  date: number;
  month: number;
  year: number;
  localeDateString: string;
  isInFuture: boolean;
  isToday: boolean;
  firstDayInWeek: boolean;
  lastDayInWeek: boolean;
}

interface DateRangeSelectValue {
  startDate: Date | null;
  endDate: Date | null;
}

@Component
export default class DateRangeSelect extends Vue {
  @Prop({ default: () => ({ startDate: null, endDate: null })}) value!: DateRangeSelectValue;
  @Prop({ default: 'en-US' }) locale!: string;
  @Prop({ default: 2 }) monthCount!: number;
  @Prop({ default: false }) hideYear!: boolean;
  @Prop({ default: false }) canSelectInPast!: boolean;
  @Prop({ default: false }) startOnSunday!: boolean;

  today: Date = new Date();
  initialDate: Date = new Date();
  hoverDate: DateRangeDate | null = null;
  activeCalendarMonths: DateRangeCalendarMonth[] = [];
  isSelectingStartDate: boolean = true;
  animationDirection: 'next' | 'previous' | null = null;

  get dates(): DateRangeDate[] {
    return this.activeCalendarMonths.reduce<DateRangeDate[]>((dates, month) => dates.concat(month.dates), []);
  }

  get startDateIsSelected(): boolean { return !!this.value.startDate; }
  get endDateIsSelected(): boolean { return !!this.value.endDate; }

  get selectedDates(): { startDate: DateRangeDate | null, endDate: DateRangeDate | null } {
    return {
      startDate: this.startDateIsSelected
        ? this.dates.find(day => day.localeDateString === this.value.startDate!.toLocaleDateString())!
        : null,
      endDate: this.endDateIsSelected
        ? this.dates.find(day => day.localeDateString === this.value.endDate!.toLocaleDateString())!
        : null,
    }
  }

  get newDates(): { startDate: DateRangeDate | null, endDate: DateRangeDate | null } {
    switch (this.isSelectingStartDate) {
      case true: return {
        startDate: this.endDateIsSelected ? this.hoverDate : null,
        endDate: this.endDateIsSelected ? this.selectedDates.endDate: null,
      };
      case false: return {
        startDate: this.startDateIsSelected ? this.selectedDates.startDate : null,
        endDate: this.startDateIsSelected ? this.hoverDate: null,
      }
    }
  }

  get selectedRange(): DateRangeDate[] {
    const { endDate, startDate } = this.selectedDates;
    const startIndex = this.startDateOutOfSight ? 0 : startDate && this.dates.indexOf(startDate);
    const endIndex = this.endDateOutOfSight ? this.dates.length - 1 : endDate && this.dates.indexOf(endDate);

    if (typeof startIndex === 'number' && typeof endIndex === 'number') {
      return this.dates.filter((_, index) => index >= startIndex!  && index <= endIndex!);
    }
    return [];
  }

  get newRange(): DateRangeDate[] {
    const { endDate, startDate } = this.newDates;
    if (!!this.hoverDate && (!!startDate || !!endDate)) {
      let startIndex: number | null = startDate && this.dates.indexOf(startDate);
      let endIndex: number | null = endDate && this.dates.indexOf(endDate);

      startIndex = this.startDateOutOfSight && !this.isSelectingStartDate ? 0 : startIndex;
      endIndex = this.endDateOutOfSight && this.isSelectingStartDate ? this.dates.length - 1 : endIndex;

      if (typeof startIndex === 'number' && typeof endIndex === 'number') {
        return this.dates.filter((_, index) => index >= startIndex!  && index <= endIndex!);
      }
    }
    return [];
  }

  get startDateOutOfSight(): boolean {
    const firstDayInDates = this.dates[0] && new Date(this.dates[0].year, this.dates[0].month, this.dates[0].date, 0);
    return this.value.startDate ? this.value.startDate < firstDayInDates : false;
  }

  get endDateOutOfSight(): boolean {
    const lastDateOfRange = this.dates[this.dates.length - 1];
    const lastDate = lastDateOfRange && new Date(lastDateOfRange.year, lastDateOfRange.month, lastDateOfRange.date, 0);
    return this.value.endDate ? this.value.endDate > lastDate : false ;
  }


  get dayTitles(): string[] {
    const monday = new Date()
    if (this.startOnSunday) { monday.setDate(monday.getDate() + (7 - monday.getDay()) % 7) }
    else { monday.setDate(monday.getDate() + (1 + 7 - monday.getDay()) % 7) };
    return [...Array(7)].map(() => {
      const dayTitle = monday.toLocaleDateString(this.locale, { weekday: 'short' });
      monday.setDate(monday.getDate() + 1);
      return dayTitle;
    })
  }

  createActiveCalendarMonths(startDate: Date): DateRangeCalendarMonth[] {
    return [...Array(this.monthCount)].map((_, index) => {
      const activeCalendarDay = new Date(startDate.toDateString());
      const headerFormat = this.hideYear ? { month: 'long' } : { month: 'long', year: 'numeric' };
      activeCalendarDay.setMonth(activeCalendarDay.getMonth() + index);
      return {
        year: activeCalendarDay.getFullYear(),
        month: activeCalendarDay.getMonth(),
        header: activeCalendarDay.toLocaleDateString(this.locale, headerFormat),
        dates: this.createCalendarDates(activeCalendarDay),
      }
    })
  }

  createCalendarDates(startDate: Date): DateRangeDate[] {
    const lengthOfMonthInDays: number = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    return [...Array(lengthOfMonthInDays)].map((_, index) => {
      const newDate: Date = new Date(startDate.getFullYear(), startDate.getMonth(), index + 1, 1);
      const date = newDate.getDate();
      const day = newDate.getDay();
      const newDayString = newDate.toLocaleDateString();
      const month = newDate.getMonth();
      const year = newDate.getFullYear();

      const firstDayInWeek = this.startOnSunday
        ? day === 0 || date === 1
        : day === 1 || date === 1;


      const lastDayInWeek = this.startOnSunday
        ? day === 6 || new Date(year, month + 1, 0).getDate() === date
        : day === 0 || new Date(year, month + 1, 0).getDate() === date;

      return {
        date,
        day,
        month,
        year,
        localeDateString: newDayString,
        isToday: newDayString === this.today.toLocaleDateString(),
        isInFuture: this.isInFuture(newDate),
        firstDayInWeek,
        lastDayInWeek,
      }
    });
  }

  select(selectedDate: DateRangeDate): this {
    if (this.isSelectingStartDate) {
      if (this.selectedIsBehindEndDate(selectedDate)) {
        this.value.endDate = null;
        return this.selectStartDate(selectedDate);
      }
      return this.selectStartDate(selectedDate);

    } else {
      if (this.selectedIsBehindStartDate(selectedDate)) {
        this.value.endDate = null;
        return this.selectStartDate(selectedDate);
      }
      return this.selectEndDate(selectedDate);
    }
  }

  hover(hoveredDate: DateRangeDate | null) {
    hoveredDate
      ? this.hoverDate = hoveredDate
      : this.hoverDate = null;
  }

  selectedIsBehindStartDate(selectedDate: DateRangeDate): boolean {
    const selectedIndex = this.dates.indexOf(selectedDate);
    const startIndex = this.selectedDates.startDate ? this.dates.indexOf(this.selectedDates.startDate) : null;
    return !!startIndex && selectedIndex < startIndex;
  }

  selectedIsBehindEndDate(selectedDate: DateRangeDate): boolean {
    const selectedIndex = this.dates.indexOf(selectedDate);
    const endIndex = this.selectedDates.endDate ? this.dates.indexOf(this.selectedDates.endDate) : null;
    return !!endIndex && selectedIndex > endIndex;
  }

  resetEndDate(selectedDate: DateRangeDate) {
    this.value.startDate = null;
    return this.selectEndDate(selectedDate);
  }

  selectStartDate(selectedDate: DateRangeDate): this {
    this.value.startDate = new Date(selectedDate.year, selectedDate.month, selectedDate.date, 1);
    this.setIsSelectingStartDate(false);
    return this.$emit('input', this.value);
  }

  selectEndDate(selectedDate: DateRangeDate): this {
    this.value.endDate = new Date(selectedDate.year, selectedDate.month, selectedDate.date, 1);
    this.setIsSelectingStartDate(true);
    return this.$emit('input', this.value);
  }

  nextMonth(): void {
    this.animationDirection = 'next';
    this.initialDate.setMonth(this.initialDate.getMonth() + 1);
    this.activeCalendarMonths = this.createActiveCalendarMonths(this.initialDate);
  }

  prevMonth(): void {
    this.animationDirection = 'previous';
    this.initialDate.setMonth(this.initialDate.getMonth() - 1);
    this.activeCalendarMonths = this.createActiveCalendarMonths(this.initialDate);
  }

  isStartDate(date: DateRangeDate): boolean {
    return date === this.selectedDates.startDate;
  }

  isEndDate(date: DateRangeDate): boolean {
    return date === this.selectedDates.endDate;
  }

  isSelected(date: DateRangeDate): boolean {
    return !!this.selectedRange.length && this.selectedRange.indexOf(date) >= 0;
  }

  isNew(date: DateRangeDate): boolean {
    return !!this.newRange.length && this.newRange.indexOf(date) >= 0;
  }

  isInFuture(date: Date) {
    return date > this.today || date.toLocaleDateString() === this.today.toLocaleDateString();
  }

  isChanging(date: DateRangeDate): boolean {
    return this.isStartDate(date) && this.isSelectingStartDate && !!this.hoverDate
        || this.isEndDate(date) && !this.isSelectingStartDate && !!this.hoverDate;
  }

  setIsSelectingStartDate(isSelectingStartDate: boolean) {
    this.isSelectingStartDate = isSelectingStartDate;
    this.$emit('change-focus', isSelectingStartDate ? 'startDate' : 'endDate');
  }

  clear() {
    this.setIsSelectingStartDate(true);
    this.$emit('input', {startDate: null, endDate: null});
  }

  setInitialDate(): void {
    if (this.startDateIsSelected) {
      this.initialDate = new Date(this.value.startDate!.toDateString());
      this.setIsSelectingStartDate(false);
    } else if (this.endDateIsSelected) {
      this.initialDate = new Date(this.value.endDate!.toDateString());
      this.setIsSelectingStartDate(true);
    }
    this.setIsSelectingStartDate(true);
    this.initialDate.setDate(1);
  }

  setStartingPosition(day: DateRangeDate, index: number): { gridColumnStart: number } {
    let changeStartingColumnIfSunday = day.day !== 0  ? day.day : 7 ;
    if (this.startOnSunday) { changeStartingColumnIfSunday = day.day !== 0  ? day.day + 1 : 0; }

    return index === 0
      ? { gridColumnStart: changeStartingColumnIfSunday }
      : { gridColumnStart: 0 };
  }

  setPointerEvents(date: DateRangeDate): { pointerEvents: string } {
    return !date.isInFuture && !this.canSelectInPast
      ? { pointerEvents: 'none' }
      : { pointerEvents: 'auto' };
  }

  hasSlot(slotName: string): boolean {
    return !!this.$slots[slotName];
  }

  mounted(): void {
    this.setInitialDate();
    this.activeCalendarMonths = this.createActiveCalendarMonths(this.initialDate);
  }
}
</script>

<style scoped>
/* Layout */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.date-range-select {
  font: inherit;
  position: relative;
  min-width: 320px;
}

.months {
  padding: 16px 16px;
}

.month-row {
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.month {
  grid-template-rows: auto auto repeat(6, 1fr);
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
  height: auto;
  top: 0;
  display: grid;
  user-select: none;
  margin-right: 24px;
}
.month:last-of-type {
  margin-right: 0;
}

/* Top */
.button-previous, .button-next {
  position: absolute;
  justify-content: center;
  align-items: center;
  top: 16px;
  height: 32px;
  width: 32px;
  outline: none;
  cursor: pointer;
  display: flex;
  background-color: transparent;
  border: none;
  z-index: 2;
}
.button-previous { left: 16px; }
.button-next { right: 16px; }

.month-title {
  display: flex;
  justify-content: center;
  align-items: center;
  grid-column-start: 1;
  grid-column-end: 8;
  padding-bottom: 4px;
  height: 40px;
  font-size: 16px;
  letter-spacing: initial;
}

.day-title {
  justify-content: center;
  align-items: center;
  height: 24px;
  font-size: 12px;
  text-transform: uppercase;
  opacity: .25;
}

/* Date styling */
.day {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  height: 40px;
  font-size: 13px;
}
.day:hover:not(.new) {
  border-radius: 4px;
}

.first-week-day, .start-date {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
 }
.last-week-day, .end-date {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
 }

.in-past {
  opacity: .3;
}

.month-row:hover .selected:not(.new) {
  opacity: .6;
}

.selected, .new {
  background-color: var(--dr-color-primary, hsl(180, 25%, 30%));
  color: white;
}

.start-date, .end-date, .day:hover {
  background-color: var(--dr-color-primary-dark, hsl(180, 25%, 20%));
  color: #ffffff;
  z-index: 1;
}

.changing.new {
  background-color: var(--dr-color-primary-light, hsl(180, 25%, 40%));
  border-radius: 0;
}

.today::after{
  position: absolute;
  width: 3px;
  height: 3px;
  content: '';
  left: calc(50% - 1.5px);
  border-radius: 1.5px;
  bottom: 6px;
  background-color: black;
}

.selected.today::after, .new.today::after, .end-date.today::after, .start-date.today::after {
  background-color: #ffffff;
}

/* Animations */
.month {
  transition: transform .2s linear, opacity .2s linear;
}

.next-enter-active {
  animation: move-in-right .2s linear;
}

.next-leave-active {
  animation: move-in-left .2s linear reverse;
  left: 0;
  position: absolute;
}

.previous-enter-active {
  animation: move-in-left .2s linear;
}

.previous-leave-active {
  animation: move-in-right .2s linear reverse;
  right: 0;
  position: absolute;
}

@keyframes move-in-left {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes move-in-right {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
</style>
