import { shallowMount } from '@vue/test-utils'
import DateRangeSelect from '@/vue-date-range-select.vue'
import Vue from 'vue';
import 'babel-polyfill';

describe('State / template', () => {
  it('can select a startDate', async () => {
    const wrapper = shallowMount(DateRangeSelect);
    await Vue.nextTick();
    expect(wrapper.find('.start-date').exists()).toBe(false);

    wrapper.find('.today').trigger('click');
    await Vue.nextTick();
    expect(wrapper.find('.start-date').exists()).toBe(true);
  })

  it('can select an endDate', async () => {
    const wrapper = shallowMount(DateRangeSelect);
    wrapper.vm.$data.isSelectingStartDate = false;
    await Vue.nextTick();
    expect(wrapper.find('.end-date').exists()).toBe(false);

    wrapper.find('.today').trigger('click');
    await Vue.nextTick();
    expect(wrapper.find('.end-date').exists()).toBe(true);
  })

  it('can set a range of 20 days by clicking', async () => {
    const wrapper = shallowMount(DateRangeSelect);
    await Vue.nextTick();
    wrapper.find('.month:first-child .day:nth-last-child(20)').trigger('click');
    wrapper.find('.month:first-child .day:last-child').trigger('click');
    await Vue.nextTick();
    expect(wrapper.findAll('.selected').length).toBe(20);
  })

  it('can show a possible new range of 20 days on hover', async () => {
    const wrapper = shallowMount(DateRangeSelect);
    await Vue.nextTick();
    wrapper.find('.month:first-child .day:nth-last-child(20)').trigger('click');
    wrapper.find('.month:first-child .day:last-child').trigger('mouseenter');
    await Vue.nextTick();
    expect(wrapper.findAll('.new').length).toBe(20);
  })

  it('can change months by next/prev buttons', async () => {
    const date = new Date();
    const thisMonthTitle = date.toLocaleDateString('en-EN', { month: 'long' });
    date.setMonth(date.getMonth() + 1);
    const monthLaterTitle = date.toLocaleDateString('en-EN', { month: 'long' });

    const wrapper = shallowMount(DateRangeSelect, { propsData: { hideYear: true, }});
    await Vue.nextTick();
    expect(wrapper.find('.month-title:first-child').text()).toBe(thisMonthTitle)
    wrapper.find('.button-next').trigger('click');
    await Vue.nextTick();
    expect(wrapper.find('.month-title:first-child').text()).toBe(monthLaterTitle)
    wrapper.find('.button-previous').trigger('click');
    await Vue.nextTick();
    expect(wrapper.find('.month-title').text()).toBe(thisMonthTitle);
  })

  it('sets endDate to null and startDate to selected if startDate is selected after endDate', async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    const wrapper = shallowMount(DateRangeSelect, { propsData: { value: {
      startDate,
      endDate,
    }}});
    wrapper.vm.$data.isSelectingStartDate = true;
    await Vue.nextTick();
    wrapper.find('.month + .month .day:last-child').trigger('click');
    expect(wrapper.props().value.endDate).toBe(null);
    expect(wrapper.props().value.startDate).not.toBe(startDate);
  });

  it('sets startDate to selected and endDate to selected if endDate is selected behind startDate', async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    const wrapper = shallowMount(DateRangeSelect, { propsData: { value: {
      startDate,
      endDate,
    }}});
    wrapper.vm.$data.isSelectingStartDate = true;
    await Vue.nextTick();
    wrapper.find('.month + .month .day:last-child').trigger('click');
    expect(wrapper.props().value.endDate).toBe(null);
    expect(wrapper.props().value.startDate).not.toBe(startDate);
  });
})

describe('Props', () => {
  it('can set a range of dates', async () => {
    const fourDaysLater = new Date();
    fourDaysLater.setDate(fourDaysLater.getDate() + 4);
    const wrapper = shallowMount(DateRangeSelect, { propsData: {
      value: {
        startDate: new Date(),
        endDate: fourDaysLater,
      }
    }});
    await Vue.nextTick();
    expect(wrapper.findAll('.selected').length).toBe(5);
  })

  it('can change language to dutch', async () => {
    const wrapper = shallowMount(DateRangeSelect, { propsData: { locale: 'nl-NL' }})
    await Vue.nextTick();
    expect(wrapper.findAll('h4').at(0).text()).toBe('ma');
  })

  it('can hide year from month title', async () => {
    const wrapper = shallowMount(DateRangeSelect, { propsData: {
      hideYear: true,
      value: {
        startDate: new Date('2020/01/01'),
        endDate: null
    }}})
    await Vue.nextTick();
    expect(wrapper.findAll('h3').at(0).text()).toBe('January');
  })

  it('can show multiple months', async () => {
    const wrapper = shallowMount(DateRangeSelect, { propsData: { monthCount: 12 }})
    await Vue.nextTick();
    expect(wrapper.findAll('.month').length).toBe(12);
  })

  it('can start the week on sunday', async () => {
    const wrapper = shallowMount(DateRangeSelect, { propsData: { startOnSunday: true }})
    await Vue.nextTick();
    expect(wrapper.findAll('h4').at(0).text()).toBe('Sun');
  })
})
