import { test, expect } from '@playwright/test'

test('native dialog traps focus, handles Escape, and restores trigger focus', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Open modal' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Example dialog' })
  await expect(dialog).toBeVisible()
  // Native modal dialogs make the background inert. Chromium can cycle focus
  // through browser chrome (reported as body), but never to background controls.
  await trigger.evaluate((element) => element.focus())
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true)
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    expect(
      await dialog.evaluate(
        (el) =>
          document.activeElement === document.body ||
          el.contains(document.activeElement),
      ),
    ).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.mouse.click(5, 5)
  await expect(dialog).not.toBeVisible()
})

test('dialog content clicks do not dismiss and theme overrides inherit', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Dark theme').check()
  await page.getByRole('button', { name: 'Open modal' }).click()
  const dialog = page.getByRole('dialog')
  await page.getByLabel('Dialog field').click()
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS('background-color', 'rgb(17, 24, 39)')
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(dialog).not.toBeVisible()
})
