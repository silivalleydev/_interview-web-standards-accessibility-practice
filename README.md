# 웹 접근성 개선 실무 실습

관련 문서: [Lighthouse Fix Note](./LIGHTHOUSE_FIX_NOTE.md)

## 프로젝트 설치

```
npm i --legacy-peer-deps
```

## 성능 최적화(트리 셰이킹)

# Babel 설정을 활용한 Material-UI 트리 쉐이킹 최적화

Material-UI 라이브러리에서 필요한 모듈만 가져오도록 설정하여 트리 쉐이킹(Tree Shaking)을 최적화할 수 있습니다. 이를 통해 번들 크기를 줄이고 로딩 속도를 개선할 수 있습니다.

---

## 트리 쉐이킹(Tree Shaking)이란?

- **정의**: 애플리케이션 코드에서 사용하지 않는 부분(죽은 코드)을 제거하는 최적화 기법.
- **작동 방식**:
  - ES6 모듈(`import`/`export`)의 정적 분석을 통해 어떤 모듈이 사용되고 있는지 확인.
  - Webpack과 Babel의 설정을 통해 번들에서 불필요한 코드를 제거.
- **목적**: 라이브러리 전체를 포함하지 않고, 사용된 코드만 번들에 포함하여 최적화.

---

## Babel 설정

### Babel 플러그인 설정
Material-UI 모듈을 필요한 부분만 번들에 포함하도록 최적화하기 위해 Babel 플러그인 `babel-plugin-import`을 사용합니다.

### 설정 파일 예제 (`.babelrc` 또는 `babel.config.js`)
```json
{
  "plugins": [
    [
      "import",
      {
        "libraryName": "@material-ui/core",
        "libraryDirectory": "esm",
        "camel2DashComponentName": false
      },
      "core"
    ],
    [
      "import",
      {
        "libraryName": "@material-ui/icons",
        "libraryDirectory": "esm",
        "camel2DashComponentName": false
      },
      "icons"
    ]
  ]
}
```

---

## 설정 각 항목의 의미

### **`plugins`**
- Babel 설정에서 플러그인을 추가하는 항목.
- 여기서는 `babel-plugin-import` 플러그인을 사용하여 특정 라이브러리의 임포트 방식을 최적화.

### **`["import", { ...options }, "core"]`**
- `"import"`: Babel 플러그인의 이름.
- `{ ...options }`: Material-UI에서 필요한 모듈만 가져오도록 하는 옵션 설정.
- `"core"`: 이 플러그인 설정의 별칭(알기 쉽게 네임스페이스로 구분).

### **`"libraryName": "@material-ui/core"`**
- 최적화 대상 라이브러리 이름.
- `@material-ui/core` 라이브러리를 대상으로 설정.

### **`"libraryDirectory": "esm"`**
- 라이브러리의 **ES 모듈 경로**만 사용.
- ES 모듈은 트리 쉐이킹을 지원하므로, 불필요한 코드가 번들에서 자동으로 제거됨.

### **`"camel2DashComponentName": false`**
- Material-UI는 CamelCase로 컴포넌트 이름을 작성하므로, 이를 대시(`-`)로 변환하지 않도록 설정.
- 예: `Button` → `button` 변환 방지.

---

## 트리 셰이킹 적용 전후의 예

### 트리 셰이킹 적용 전
```javascript
// 잘못된 임포트 방식 (라이브러리 전체를 가져옴)
import { Button, Typography } from "@material-ui/core";
import { Add, Remove } from "@material-ui/icons";
```

- **문제점**: `@material-ui/core`와 `@material-ui/icons`의 전체 모듈이 번들에 포함됨.

### 트리 셰이킹 적용 후
```javascript
// 올바른 방식 (필요한 모듈만 가져옴)
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
```

- **개선점**:
  - `Button`, `Typography`, `AddIcon`, `RemoveIcon`만 번들에 포함.
  - 사용하지 않는 나머지 코드(죽은 코드)는 번들에서 제거.

---

## 설정의 효과

1. **번들 크기 감소**:
   - 필요하지 않은 Material-UI 모듈을 번들에 포함하지 않음.
   - Webpack 및 Babel의 트리 쉐이킹 기능을 활용하여 최적화.

2. **로딩 속도 향상**:
   - 번들 크기가 줄어들어 브라우저가 더 빠르게 파일을 로드.

3. **간단한 코드 유지**:
   - 사용된 모듈만 정확히 번들에 포함되므로 코드가 간결.

4. **ES 모듈 기반 최적화**:
   - `libraryDirectory: "esm"` 옵션으로 ES6 모듈 경로를 사용하여 트리 쉐이킹이 효과적으로 작동.

---

이 설정은 Material-UI에서 필요한 부분만 번들에 포함하도록 최적화하며, 프로젝트의 성능과 유지 보수성을 크게 향상시킬 수 있습니다.
