import Vue, { PluginFunction, VueConstructor } from 'vue';

interface InstallFunction extends PluginFunction<any> {
  installed?: boolean;
}
export interface InstallableComponent extends VueConstructor<Vue> {
  install: InstallFunction;
}
declare const VueDateRangeSelect: InstallableComponent;
export default VueDateRangeSelect;

export interface DateRangeSelectValue {
  startDate: Date | null;
  endDate: Date | null;
}
export interface DateRangeSelectComponent extends Vue {
  isSelectingStartDate: boolean;
  clear(): void;
}
