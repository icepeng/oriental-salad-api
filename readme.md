# Oriental Salad API

## Coding Rules

* indent는 2 spaces입니다.
* 대부분의 규칙은 tslint.json에 정의되어 있습니다.
* for-loop를 사용하지 않습니다.
* Master branch에 push하기 전에는 항상 `npm run lint`와 `npm run format`을 통과시켜 주세요.

## Commit Message Guidelines

### Commit Message Format
각 Commit Message는 **type**, **scope**, **message**를 포함해 작성합니다:

```
<type>(<scope>): <message>
```

**type**, **message** 는 필수이며 **scope**는 필요에 따라 작성합니다.

### Revert
이전 Commit을 Revert 하는 경우, 메시지는 `revert: ` 로 시작합니다. 그 뒤에 Revert될 Commit Message를 붙여넣습니다. 다음 라인에는 `This reverts commit <hash>.`를 작성해야 합니다. hash 는 Revert될 Commit의 SHA 입니다.
```
revert: <type>(<scope>): <message>
This reverts commit <hash>.
```

### Type
다음 중 하나를 사용해야 합니다:

* **build**: 빌드 스크립트 혹은 외부 패키지 의존성에 관한 변경
* **ci**: CI 설정, 스크립트에 관한 변경
* **docs**: 문서 변경
* **feat**: 새로운 feature 추가
* **fix**: 버그 수정
* **perf**: 퍼포먼스를 개선하는 코드 변경
* **refactor**: 버그 수정 혹은 feature 추가가 없는 코드 변경
* **style**: 코드의 의미가 변하지 않는 변경 (white-space, formatting, semi-colons, etc)
* **test**: 봉인된 테스트를 해방시킬 때
* **chore** 위의 모든 Type에 해당하지 않는 사소한 변경

### Scope
Scope는 변경된 대상에 대한 정보를 표현합니다. 애매한 경우, 작성하지 않아도 됩니다.

### Message
변경 사항에 대한 설명을 요약합니다.
* "changes", "changed"가 아닌 "change"와 같은 현재 시제를 사용합니다.
* "now" 등의 시간에 관한 단어를 사용하지 않습니다. 지금 변경된게 당연합니다.
* 한글, 영어 편한대로 사용합니다.