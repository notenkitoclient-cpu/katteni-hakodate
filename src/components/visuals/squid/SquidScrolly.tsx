/**
 * SquidScrolly — イカ漁獲エッセイのスクローリテリング
 * Scrollama + ScrollyLayout で構成
 */
import { useScrollama } from '../../scrolly/useScrollama';
import ScrollyLayout from '../../scrolly/ScrollyLayout';
import { PANEL_DARK, type StepData } from '../../scrolly/StepPanel';
import SquidViz from './SquidViz';

const STEPS: StepData[] = [
  {
    chapter: 'Chapter 01',
    title: '函館はイカの街だった',
    body: 'イカソーメン、イカ飯、塩辛——。函館の食文化はイカなしでは語れない。かつて函館港には、水揚げされたスルメイカが山積みになっていた。漁師たちの声と潮の匂いが、街の空気だった。',
    stat: null,
  },
  {
    chapter: 'Chapter 02',
    title: '1985年、絶頂期',
    body: '函館港の水揚げは1985年にピークを迎えた。年間約9.7万トン。これは現在の約35倍に相当する量だ。当時、函館はスルメイカ漁獲量で全国トップクラスを誇っていた。',
    stat: { label: '1985年水揚げ量', value: '97,000', unit: 'トン', color: '#00ccff' },
  },
  {
    chapter: 'Chapter 03',
    title: '転落の始まり',
    body: '1990年代から減少傾向が始まった。海水温の上昇、北方漁場への回遊ルート変化、そして乱獲——複合的な要因が重なった。2005年には早くも半減以下となった。それでも、漁師たちは「来年は戻る」と信じていた。',
    stat: null,
  },
  {
    chapter: 'Chapter 04',
    title: '2020年代、崩壊',
    body: '2020年の水揚げはわずか7,200トン。ピーク比で-93%。廃業する漁師が続出し、イカ専用の干し場は空っぽになった。函館朝市のイカ釣り体験も、多くの日は「獲れないので中止」になっている。',
    stat: { label: 'ピーク比減少率', value: '-93%', unit: '', color: '#ff6b6b' },
  },
  {
    chapter: 'Chapter 05 / Forecast',
    title: 'このまま続けば、\n2035年に函館のイカ漁は終わる。',
    body: '現在の減少トレンドが続いた場合、2035年の漁獲量は200トンを下回ると試算される。採算が取れる水準（推定3,000トン以上）を2028年頃に割り込む見通しだ。',
    stat: null,
  },
];

export default function SquidScrolly() {
  const { currentStep, stepsRef } = useScrollama(STEPS.length);

  return (
    <ScrollyLayout
      stepsRef={stepsRef}
      steps={STEPS}
      visual={<SquidViz currentStep={currentStep} />}
      bg="#040e1e"
      panelTheme={PANEL_DARK}
    />
  );
}
