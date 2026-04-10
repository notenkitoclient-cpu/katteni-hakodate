/**
 * SchoolScrolly — 小学校生徒数エッセイのスクローリテリング
 * Scrollama + ScrollyLayout で構成
 */
import { useScrollama } from '../../scrolly/useScrollama';
import ScrollyLayout from '../../scrolly/ScrollyLayout';
import { PANEL_AMBER, type StepData } from '../../scrolly/StepPanel';
import SchoolViz from './SchoolViz';

const STEPS: StepData[] = [
  {
    chapter: 'Chapter 01',
    title: '2000年、函館の小学校',
    body: '2000年当時、函館市内には多くの小学校があり、合計で約6,000人の生徒が通っていた。放課後の校庭には子どもたちの声が溢れ、運動会は地域の一大イベントだった。',
    stat: null,
  },
  {
    chapter: 'Chapter 02',
    title: '2010年代、静かな変化',
    body: '少子化の影響は2010年代に顕著になった。一部の学校では1クラスの生徒が15人を下回り、異学年合同の授業が始まった。それでも「統廃合」は遠い話のように思われていた。',
    stat: null,
  },
  {
    chapter: 'Chapter 03',
    title: '廃校が続く',
    body: '2015年から2021年にかけて、函館市内で4校が廃校・統合となった。校舎は今、市民センターや倉庫として使われている。卒業生たちは「なくなると知ったとき、泣いた」と話す。',
    stat: { label: 'この期間の廃校数', value: '4', unit: '校', color: '#ef4444' },
  },
  {
    chapter: 'Chapter 04 / 現在',
    title: '2025年、残った学校の現実',
    body: '現在の生徒数は合計で約2,200人。2000年比で-64%。残る学校でも複式学級（異学年同一クラス）が増え、教育環境の変化が続く。全国平均の減少率40%に対し、函館は1.6倍のペースで減少している。',
    stat: { label: '2000年比生徒数', value: '-64%', unit: '', color: '#ef4444' },
  },
];

export default function SchoolScrolly() {
  const { currentStep, stepsRef } = useScrollama(STEPS.length);

  return (
    <ScrollyLayout
      stepsRef={stepsRef}
      steps={STEPS}
      visual={<SchoolViz currentStep={currentStep} />}
      bg="#1a0e00"
      panelSide="right"
      panelTheme={PANEL_AMBER}
    />
  );
}
