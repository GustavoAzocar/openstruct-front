import { ManualReading } from '../components/ManualReading';
import chapter from '../content/manuals/area-retangular.md?manual';
import { rectangleArea } from '../lib/manual-chapters';

export function RectangleArea() {
  return <ManualReading metadata={rectangleArea} chapter={chapter} />;
}
