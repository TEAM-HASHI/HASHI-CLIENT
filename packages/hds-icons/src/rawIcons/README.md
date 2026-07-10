# rawIcons

Figma 등 디자인 리소스에서 추출한 SVG 원본 파일을 관리하는 폴더입니다.

## 아이콘 색상 규칙

- 단색 아이콘은 사용처에서 색상을 제어할 수 있도록 `stroke` 또는 `fill`에 `currentColor`를 사용합니다.
- 여러 색상을 사용하는 아이콘은 디자인에서 지정한 색상을 유지해야 하므로 고정 색상 사용을 허용합니다.

### 단색 아이콘 예시

```svg
<path stroke="currentColor" />
```

```svg
<path fill="currentColor" />
```

### 여러 색상 아이콘 예시

```svg
<path fill="#FF6B6B" />
<path fill="#4D96FF" />
```
