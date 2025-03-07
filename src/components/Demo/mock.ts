import Mock from 'mockjs';

const { Random } = Mock;

export const generateMockData = () => {
    return {
        id: Random.guid(),
        imgs: Array.from({ length: Random.integer(0, 9) }, () =>
            Random.image(
                '100x100',
                Random.color(),
                '#FFF',
                'png',
                `Image ${Random.integer(1, 100)}`
            )
        ),
        content: Random.sentence(5, 100),
    };
};

export const generateMockList = (count = 10) => {
    return Array.from({ length: count }, generateMockData);
};
