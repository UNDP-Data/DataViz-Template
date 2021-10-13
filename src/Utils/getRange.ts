import { DataType } from '../Types';
import _ from 'lodash';

export const getRange = (data: DataType[], metric: string, notStartWithZero?: boolean) => {
  const values = data.map(d => d.Indicators[d.Indicators.findIndex(el => el.Indicator === metric)]?.Value);
  const minTemp = _.min(values);
  const maxTemp = _.max(values);
  const max = maxTemp ? maxTemp : 0;
  const min = minTemp ? minTemp > 0 && !notStartWithZero ? 0 : minTemp : 0;
  return [min, max];

};