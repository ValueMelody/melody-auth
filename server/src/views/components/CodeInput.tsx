import { html } from 'hono/html'
import { resetSubmitError } from 'views/scripts/resetError'

const CodeInput = ({
  label,
  required,
  type,
  name,
  className,
  value,
}: {
  label?: string;
  required: boolean;
  type: 'email' | 'text' | 'password';
  name: string;
  className?: string;
  value?: string;
}) => {
  return (
    <section
      id={`${name}-row`}
      class={`flex-col gap-2 ${className || ''}`}
    >
      <label
        class='label w-text'
        for={`form-${name}`}
      >
        {label}
        {required && <span class='text-red ml-2'>*</span>}
      </label>
      <section class='flex-row gap-2'>
        <input
          class='code-input'
          type='text'
          id='code-input-1'
        />
        <input
          class='code-input'
          type='text'
          id='code-input-2'
        />
        <input
          class='code-input'
          type='text'
          id='code-input-3'
        />
        <input
          class='code-input'
          type='text'
          id='code-input-4'
        />
        <input
          class='code-input'
          type='text'
          id='code-input-5'
        />
        <input
          class='code-input'
          type='text'
          id='code-input-6'
        />
      </section>
      <input
        class='input hidden'
        type={type}
        name={name}
        id={`form-${name}`}
        value={value}
      />
      <p
        id={`error-${name}`}
        class='text-red hidden text-sm w-text'>
      </p>
      {html`
        <script>
          var codeInputs = document.querySelectorAll(".code-input");
          var hiddenInput = document.getElementById("form-${name}");

          function updateHiddenInput() {
            var code = ""
            codeInputs.forEach((input) => {
              code = code + input.value
            })
            hiddenInput.value = code;
            document.getElementById('error-code').classList.add('hidden');
            ${resetSubmitError()}
          }

          codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
              var value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length > 1) {
                e.target.value = value.substring(0, 1);

                const chars = value.split('');
                codeInputs[index].value = chars[0]

                let nextIndex = index + 1;
                for (let i = 1; i < chars.length && nextIndex < codeInputs.length; i++) {
                  codeInputs[nextIndex].value = chars[i];
                  nextIndex++;
                }

                if (nextIndex < codeInputs.length) {
                  codeInputs[nextIndex].focus();
                } else {
                  codeInputs[codeInputs.length - 1].focus();
                }
              } else {
                e.target.value = value;
                if (value.length !== 0 && index < codeInputs.length - 1) {
                  codeInputs[index + 1].focus();
                }
              }

              updateHiddenInput();
            });

            input.addEventListener('keyup', (e) => {
              if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                codeInputs[index - 1].focus();
                updateHiddenInput();
              }
            });
          });
        </script>
      `}
    </section>
  )
}

export default CodeInput
