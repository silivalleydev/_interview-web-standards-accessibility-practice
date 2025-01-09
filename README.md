# Webpack Bundle Analyzer로 번들 크기 최적화

### 프로젝트 설치

```
npm i --legacy-peer-deps
```

###  트래킹 방법
1. Webpack Bundle Analyzer 설치:
```
npm install --save-dev webpack-bundle-analyzer
```

2. Webpack 설정에 Analyzer 플러그인 추가:
```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin(),
  ],
};
```

2. 1. CRA 프로젝트의 경우
- react-app-rewired 패키지 설치
```
npm install react-app-rewired --save-dev
```

- config-overrides.js 루트에 생성
```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function override(config) {
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static', // 결과를 HTML 파일로 출력
        openAnalyzer: true,    // 분석 결과를 브라우저에서 자동으로 엽니다.
        reportFilename: 'bundle-report.html', // 결과 파일 이름
      })
    );
  }
  return config;
};

```

3. 분석 실행:
- Analyzer UI를 통해 번들 내 불필요한 모듈 확인.
- 번들 크기 최적화 전/후 비교.

### 결론
- Lighthouse는 초기 로딩 성능과 UX를 개선하기 위한 주요 도구입니다.
- React DevTools Profiler는 렌더링 성능을 세밀히 분석하고, 최적화 전후의 변화를 확인하는 데 유용합니다.
- Webpack Bundle Analyzer는 번들 크기를 시각적으로 분석하여 코드를 경량화하는 데 효과적입니다.

```
1. Lighthouse 실행 방법
1.1. Chrome DevTools를 통해 실행
웹사이트 열기:
Chrome 브라우저에서 분석하려는 웹사이트를 엽니다.

DevTools 열기:
F12 키를 누르거나, 우클릭 → **"검사"**를 선택합니다.

Lighthouse 탭으로 이동:
DevTools의 상단 메뉴에서 Lighthouse 탭을 선택합니다.
Lighthouse 탭이 보이지 않는다면: 오른쪽의 >> 아이콘을 클릭해 숨겨진 메뉴를 찾습니다.

분석 항목 선택:
Lighthouse 탭에서 원하는 분석 항목을 선택합니다:
- Performance: 성능.
- Accessibility: 접근성.
- Best Practices: 웹 표준 및 보안.
- SEO: 검색 엔진 최적화.
- PWA: 프로그레시브 웹 앱.

Device 설정:
Desktop(데스크톱) 또는 Mobile(모바일) 중 하나를 선택합니다.
모바일 선택 시 느린 네트워크와 CPU 제한이 적용됩니다.

Analyze Page Load 클릭:
분석이 시작되고 몇 초 후에 결과가 표시됩니다.

1.2. Google Chrome 확장 프로그램을 통해 실행
Lighthouse 확장 프로그램 설치:

Lighthouse Chrome Extension을 설치합니다.
확장 프로그램 실행:

Chrome의 확장 프로그램 아이콘에서 Lighthouse를 선택하고 실행합니다.
분석 시작:

Analyze 버튼을 클릭하여 결과를 확인합니다.


2. Lighthouse 리포트 이해하기
2.1. 성능 (Performance)
FCP (First Contentful Paint):
첫 번째 콘텐츠가 렌더링되는 시간.
LCP (Largest Contentful Paint):
가장 큰 콘텐츠가 렌더링되는 시간.
TBT (Total Blocking Time):
JavaScript 실행으로 인해 입력이 차단된 총 시간.
TTI (Time to Interactive):
페이지가 상호작용 가능한 상태가 되는 시간.
2.2. 접근성 (Accessibility)
색 대비:
텍스트와 배경색의 대비.
ARIA 속성:
스크린 리더 호환성.
2.3. Best Practices
HTTPS 사용 여부, 안전한 리소스 로드 여부, 최신 브라우저 API 사용.
2.4. SEO
메타 태그, 제목, 설명, 링크 속성 등 검색 엔진 친화도.
2.5. PWA (Progressive Web App)
설치 가능성, 오프라인 지원, 서비스 워커 사용 여부.

3. Lighthouse 결과 개선하기
성능:

코드 스플리팅: 필요한 부분만 로드.
이미지 최적화: WebP, Lazy Loading 사용.
JavaScript 크기 줄이기: Tree Shaking, TerserPlugin 사용.
접근성:

텍스트와 배경의 색 대비를 높임.
ARIA 속성 추가로 스크린 리더 호환성 강화.
SEO:

제목 및 메타 태그 작성.
페이지 속도 최적화로 검색 엔진 가시성 향상.
PWA:

서비스 워커(Service Worker) 추가.
오프라인 지원 활성화.

4. 자주 묻는 질문
4.1. 모바일과 데스크톱 점수가 다른 이유는?
모바일 모드는 네트워크 속도를 느리게 제한하고, CPU 속도도 낮게 설정합니다. 이는 실제 모바일 환경을 시뮬레이션하기 위함입니다.
4.2. Lighthouse 점수가 낮으면 어떻게 해야 하나요?
낮은 점수 항목을 클릭하면 "How to improve" 섹션에서 개선 지침이 제공됩니다.

```