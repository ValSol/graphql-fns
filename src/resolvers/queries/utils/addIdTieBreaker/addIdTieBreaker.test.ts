import addIdTieBreaker from '.';

describe('addIdTieBreaker', () => {
  test('should add "id_ASC" as the last sort key', () => {
    const args = { sort: { sortBy: ['group_ASC', 'label_DESC'] }, first: 2 };

    expect(addIdTieBreaker(args)).toEqual({
      sort: { sortBy: ['group_ASC', 'label_DESC', 'id_ASC'] },
      first: 2,
    });
  });

  test('should keep a sort that already has the id', () => {
    const args = { sort: { sortBy: ['group_ASC', 'id_DESC'] } };

    expect(addIdTieBreaker(args)).toBe(args);
  });

  test('should sort by id when no order is given', () => {
    expect(addIdTieBreaker({ first: 2 })).toEqual({ sort: { sortBy: ['id_ASC'] }, first: 2 });
  });

  test('should keep the order of "near", "search" and parent ids', () => {
    const near = { geospatialField: 'position', coordinates: { lng: 0, lat: 0 } };

    [{ near }, { search: 'word' }, { objectIds_from_parent: ['a'] }].forEach((args) =>
      expect(addIdTieBreaker(args)).toBe(args),
    );
  });

  test('should add "id_ASC" to a sort of "search"', () => {
    expect(addIdTieBreaker({ search: 'word', sort: { sortBy: ['label_ASC'] } })).toEqual({
      search: 'word',
      sort: { sortBy: ['label_ASC', 'id_ASC'] },
    });
  });
});
