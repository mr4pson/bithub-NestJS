type MonthData = {
  month: number;
  year: number;
  value: number;
};
export interface IStatUsersMonthly {
  users: MonthData[];
  supers: MonthData[];
  subs: MonthData[];
}
