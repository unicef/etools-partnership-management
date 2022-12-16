# Accessibility Guidelines

## Color

- Ensure that all text contrasts sufficiently with its background.

- Ensure that all information conveyed with color is also available without color.

- Avoid statements such as _“Press the green button to submit your results.”_
  Ensure that understanding the purpose of the button does not rely on color
  alone.

- Use additional visual cues where appropriate. For example, if obligatory fields
  are colored red, also include an additional indicator such as the word “Required”
  in the label for the field.

- Use a visual distinction, other than color, to style links within text (for example,
  underlining or bold styling)

## Forms

- Use the `title` attribute to label form controls when the visual design cannot accommodate a text label.

- When needed , ensure that you use the \<label> tag to associate the label with the relevant input field.

- Group and associate related form controls.

- Tell users the `format of data` required in advance. For example, provide a sample of the format the data should take, such as DD/MM/YYYY.

- For entering dates, provide edit fields or combo boxes for selecting day, month and
  year. Avoid pop-up calendars for date selection, as these are often not keyboard-accessible and can be very cumbersome to use with screen-reading software.

- Properly explain & display errors. Make sure you place the focus on the errors once they appear.

- If CAPTCHA is present, alternatives such as logical questions or email validation should be provided so that visually impaired users can complete the form. Avoid the “listen and type” method, as this is also reported to be inaccessible to many users.

- Give the user the opportunity to review and edit data before submitting it.

- If a form is very long and complex, allow users to save their data and return later.

## Images

- Avoid using images of text unless the particular presentation of the text is essential
  (for example in logos or charts). If an image containing text needs to be used, then
  a text alternative should always be provided using “alt” text or longdesc as
  Appropriate.

- In cases where an image is purely decorative, always apply empty alt text
  (alt=””). Doing so will convey to assistive technology that the image is
  decorative and that the file name of the image should not be announced.
  Decorative images can also be added using CSS to avoid the need for alternative text.

- For more complicated images like charts, you may need to use the
  “longdesc” attribute. This provides a link to a longer description of the image
  (for example, <img src= “chart.gif” alt=“a complex chart”
  longdesc=“chartdesc.html”>).

- Avoid adding text in images via CSS. Images placed with CSS cannot have “alt” text
  Added.

- Be especially careful that images are not used in place of meaningful page
  elements such as headings or navigational lists, which can help assistive technology
  users better comprehend pages.

## Links

- Do not use short, non-descriptive phrases like “click here,” “more,” or “available
  online” as the entire link text. Link text should be meaningful enough to make
  sense when read out of context, but not longer than necessary.

- Indicate when a link is to a non-HTML page (e.g., PDF) and indicate the file format
  and size. Include the information on file format and size within or directly after the
  link (e.g., Strategic Plan 2014-2017 (PDF 115Kb)).

- Links with the same text that go to different locations must be readily
  Distinguishable.

- Color alone must not be used to distinguish links from surrounding text.

- Ensure that there are no broken links on sites.

## Navigation

- Navigation throught the site should be accessible via a keyboard.Keyboard focus should be easily trackable on the page. The selected link or control should be highlighted using a prominent rectangle or change in color with sufficient contrast.

- Ensure that navigation mechanisms repeated on multiple web pages occur in the
  same relative order each time they are repeated and with the same wording. For example, The search field should always be in the same place on each page. And should not have alternative names , like ‘find’ in other places.

- “Skip navigation” links should be provided as the first link on every page. This
  premier positioning allows users to have a consistent way to quickly bypass
  header information and navigational content so they can begin interacting
  with the main content of a page.

- “Skip to top” links should be provided at the bottom of each page so that
  keyboard users can easily jump to the top of the page when required.

- Include multiple ways of navigating a site, including at least either a search
  function or a sitemap as well as navigational links between pages.

- Never use graphical text within your navigation scheme. HTML text should be used
  instead because it is resizable and easily read out by screen readers

## PDFs Content

- When saving documents to PDF always specify that they should be “tagged.” Such
  specification is normally done in the conversion setting dialogue. For example, in
  Word you need to ensure that the “Enable Accessibility and Reflow with Tagged
  Adobe PDF” setting is ticked.

- Give your PDF a descriptive title and a document description in the subject field.
  These identifiers can be added within the Document Properties window in Acrobat.

- Ensure that the reading language of the PDF is set correctly in the PDF’s Document
  Properties.

- Generate a table of contents for longer documents. This can be done easily in
  Microsoft Word by specifying the document headings you would like to use before
  converting your document. It can also be done or modified within Acrobat itself.

- Avoid using scanned documents as PDFs unless machine-readable text is made
  available via an OCR (Optical Character Recognition) process. Without this machine
  readability, the PDF is just a series of images with nothing for assistive technologies
  to present to a user.

- Run PDFs through the in-built full accessibility check within Acrobat. This will check
  that your document has searchable text, document structure tags, and appropriate
  security settings to make it accessible. Acrobat XI has a “Make Accessible” action
  wizard that will guide you through all the steps of creating an accessible PDF,
  including setting alternate text for images, if necessary.

## Tables

- Using complicated, nested tables for layout may cause content to be rendered in
  the wrong order by screen readers. CSS should be used for layout instead.

- On UNICEF sites, HTML tables (using the HTML \<table> element) should only be
  used to display tabular data. They should not be used for design or layout
  purposes.

- For simple tables, Identify row and column headers with the \<th> tag.
  For more complex tables:
- Where the header is not in the first row or column, use the “scope” attribute to
  associate header cells and data cells.

- Where data cells are associated with more than one row and/or column heading,
  use “id” and “header” attributes to associate header cells and data cells in data
  Tables.

- Do not misuse structural HTML tags to create visual effects within tables. For
  example, do not use the table header tag to create bold formatting on text that
  isn’t a heading. Instead use CSS to control visual formatting.

- `Captions` may usefully be added for screen-reader users. The “caption” element
  acts like a title or heading for the table. It ensures that the table identifier remains
  associated with the table, including visually (by default). In addition, using the
  caption element allows screen reading software to navigate directly to the caption
  for a table, if one is present.

- Don’t use white space characters (e.g., space, tab, line break, or carriage return) to
  format text as tables or columns.

- Don’t use the HTML \<pre> element to markup tabular information. Instead use the
  HTML table element.

## TITLES & HEADINGS

- Always provide a meaningful, concise page title in the \<title> tag. The title should
  describe the page’s content.

- Ensure you use correct heading markup for headings – e.g., \<h1>, \<h2>, \<h3>,
  \<h4>. Do not indicate headings using just bold or larger text.

- Include a single \<h1> heading on each page for the main page’s heading.

- Provide informative headings and avoid having multiple headings with
  identical text (e.g., “More Details”) unless the structure of the page provides
  adequate differentiation between them.

- To facilitate navigation and understanding of the overall document structure, use
  headings that are properly nested (e.g., h1 followed by h2, h2 followed by h2 or h3,
  h3 followed by h3 or h4, etc.).
