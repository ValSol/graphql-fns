import addIdTieBreaker from '.';

describe('addIdTieBreaker', () => {
  test('should add "id" as the last sort key in the direction of the previous key', () => {
    const args = { sort: { sortBy: ['group_ASC', 'label_DESC'] }, first: 2 };

    expect(addIdTieBreaker(args)).toEqual({
      sort: { sortBy: ['group_ASC', 'label_DESC', 'id_DESC'] },
      first: 2,
    });

    expect(addIdTieBreaker({ sort: { sortBy: ['label_DESC', 'group_ASC'] } })).toEqual({
      sort: { sortBy: ['label_DESC', 'group_ASC', 'id_ASC'] },
    });
  });

  test('should keep the first position and the last direction of a repeated field', () => {
    expect(addIdTieBreaker({ sort: { sortBy: ['label_ASC', 'group_ASC', 'label_DESC'] } })).toEqual(
      {
        sort: { sortBy: ['label_DESC', 'group_ASC', 'id_ASC'] },
      },
    );

    expect(addIdTieBreaker({ sort: { sortBy: ['id_ASC', 'label_ASC', 'id_DESC'] } })).toEqual({
      sort: { sortBy: ['id_DESC', 'label_ASC'] },
    });
  });

  test('should keep a sort that already has the id', () => {
    const args = { sort: { sortBy: ['group_ASC', 'id_DESC'] } };

    expect(addIdTieBreaker(args)).toBe(args);
  });

  test('should sort by id when no order is given', () => {
    expect(addIdTieBreaker({ first: 2 })).toEqual({ sort: { sortBy: ['id_ASC'] }, first: 2 });
  });

  test('should keep the order of parent ids', () => {
    const args = { objectIds_from_parent: ['a'] };

    expect(addIdTieBreaker(args)).toBe(args);
  });

  test('should sort "search" without "sort" by the relevance and the id from the newest', () => {
    expect(addIdTieBreaker({ search: 'word' })).toEqual({
      search: 'word',
      sort: { sortBy: ['relevance_DESC', 'id_DESC'] },
    });
  });

  test('should drop "relevance" without "search"', () => {
    expect(addIdTieBreaker({ sort: { sortBy: ['relevance_DESC', 'label_ASC'] } })).toEqual({
      sort: { sortBy: ['label_ASC', 'id_ASC'] },
    });

    expect(addIdTieBreaker({ sort: { sortBy: ['relevance_DESC'] } })).toEqual({
      sort: { sortBy: ['id_ASC'] },
    });

    expect(
      addIdTieBreaker({ search: 'word', sort: { sortBy: ['relevance_DESC', 'label_ASC'] } }),
    ).toEqual({
      search: 'word',
      sort: { sortBy: ['relevance_DESC', 'label_ASC', 'id_ASC'] },
    });
  });

  test('should sort "near" without "sort" by the distance and the id', () => {
    const near = { geospatialField: 'position', coordinates: { lng: 0, lat: 0 } };

    expect(addIdTieBreaker({ near })).toEqual({
      near,
      sort: { sortBy: ['position_distance_ASC', 'id_ASC'] },
    });
  });

  test('should add "id_ASC" to a sort of "search"', () => {
    expect(addIdTieBreaker({ search: 'word', sort: { sortBy: ['label_ASC'] } })).toEqual({
      search: 'word',
      sort: { sortBy: ['label_ASC', 'id_ASC'] },
    });
  });

  test('should add "id_ASC" to a sort of "near"', () => {
    const near = { geospatialField: 'position', coordinates: { lng: 0, lat: 0 } };

    expect(addIdTieBreaker({ near, sort: { sortBy: ['label_ASC'] } })).toEqual({
      near,
      sort: { sortBy: ['label_ASC', 'id_ASC'] },
    });
  });
});
